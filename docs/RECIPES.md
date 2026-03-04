# fp-core Recipes

Real-world patterns using fp-core primitives. Every snippet is valid TypeScript.

---

## Table of Contents

1. [Safe API call](#1-safe-api-call)
2. [Form validation](#2-form-validation)
3. [Safe config loading](#3-safe-config-loading)
4. [Safe nested access](#4-safe-nested-access)
5. [Collecting errors from parallel operations](#5-collecting-errors-from-parallel-operations)
6. [Async retry pipeline](#6-async-retry-pipeline)
7. [Option null-safe navigation](#7-option-null-safe-navigation)
8. [Concurrent processing with accumulated errors](#8-concurrent-processing-with-accumulated-errors)
9. [Data transformation pipeline](#9-data-transformation-pipeline)
10. [Config with defaults + validation](#10-config-with-defaults--validation)

---

## 1. Safe API call

**Use case:** Fetch data from an API, transform it, and handle errors without try/catch.

```typescript
import {
  fromPromise,
  flatMapAsync,
  mapResultAsync,
  match,
} from '@roxdavirox/fp-core';

interface User {
  id: string;
  name: string;
  roleId: string;
}

interface Role {
  id: string;
  label: string;
}

interface EnrichedUser extends User {
  role: Role;
}

const fetchUser = (id: string): Promise<User> =>
  fetch(`/api/users/${id}`).then(r => r.json() as Promise<User>);

const fetchRole = (roleId: string): Promise<Role> =>
  fetch(`/api/roles/${roleId}`).then(r => r.json() as Promise<Role>);

const enrichUser = async (user: User): Promise<EnrichedUser> => ({
  ...user,
  role: await fetchRole(user.roleId),
});

const getEnrichedUser = async (id: string) => {
  const result = await fromPromise(fetchUser(id))
    .then(flatMapAsync(user => fromPromise(enrichUser(user))))
    .then(r => mapResultAsync(async (u: EnrichedUser) => u)(r));

  return match(
    (user: EnrichedUser) => ({ status: 'ok' as const, user }),
    (error: Error) => ({ status: 'error' as const, message: error.message }),
  )(result);
};
```

---

## 2. Form validation

**Use case:** Validate multiple fields, collect all errors at once instead of stopping at the first failure.

```typescript
import { Ok, Err, validateAll, collectErrors, match } from '@roxdavirox/fp-core';
import type { Result } from '@roxdavirox/fp-core';

interface SignupForm {
  email: string;
  password: string;
  age: number;
}

const validateEmail = (form: SignupForm): Result<SignupForm, string> =>
  form.email.includes('@') ? Ok(form) : Err('Email is invalid');

const validatePassword = (form: SignupForm): Result<SignupForm, string> =>
  form.password.length >= 8
    ? Ok(form)
    : Err('Password must be at least 8 characters');

const validateAge = (form: SignupForm): Result<SignupForm, string> =>
  form.age >= 18 ? Ok(form) : Err('Must be 18 or older');

const validateForm = (form: SignupForm) => {
  const results = [
    validateEmail(form),
    validatePassword(form),
    validateAge(form),
  ];

  return match(
    () => ({ ok: true as const, form }),
    (errors: string[]) => ({ ok: false as const, errors }),
  )(collectErrors(results));
};

// Usage
const result = validateForm({ email: 'bad', password: 'short', age: 16 });
// { ok: false, errors: ['Email is invalid', 'Password must be at least 8 characters', 'Must be 18 or older'] }
```

---

## 3. Safe config loading

**Use case:** Parse and validate a JSON config file without crashing on bad input.

```typescript
import { tryCatch, flatMap, unwrapOrElse } from '@roxdavirox/fp-core';
import { Ok, Err } from '@roxdavirox/fp-core';
import type { Result } from '@roxdavirox/fp-core';

interface AppConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const defaultConfig: AppConfig = {
  apiUrl: 'http://localhost:3000',
  timeout: 5000,
  retries: 3,
};

const safeParse = tryCatch(JSON.parse);

const validateConfig = (raw: unknown): Result<AppConfig, string> => {
  if (typeof raw !== 'object' || raw === null) return Err('Config is not an object');
  const r = raw as Record<string, unknown>;
  if (typeof r['apiUrl'] !== 'string') return Err('apiUrl must be a string');
  if (typeof r['timeout'] !== 'number') return Err('timeout must be a number');
  if (typeof r['retries'] !== 'number') return Err('retries must be a number');
  return Ok(raw as AppConfig);
};

const loadConfig = (json: string): AppConfig =>
  unwrapOrElse(
    (err: unknown) => {
      console.warn('Config error:', err, '— using defaults');
      return defaultConfig;
    },
  )(flatMap(validateConfig)(safeParse(json)));

// Usage
loadConfig('{"apiUrl":"https://api.example.com","timeout":3000,"retries":2}');
// AppConfig { apiUrl: 'https://api.example.com', timeout: 3000, retries: 2 }

loadConfig('not json');
// AppConfig (defaults) — logs warning
```

---

## 4. Safe nested access

**Use case:** Read a deeply nested value that may not exist at any level without optional chaining.

```typescript
import { getPathOr, fromNullable, mapOption, unwrapOptionOr } from '@roxdavirox/fp-core';
import { pipe } from '@roxdavirox/fp-core';

interface Address {
  street?: string;
  city?: string;
  zip?: string;
}

interface Profile {
  address?: Address;
  bio?: string;
}

interface User {
  id: string;
  name: string;
  profile?: Profile;
}

const users: Record<string, User> = {
  alice: {
    id: '1',
    name: 'Alice',
    profile: { address: { city: 'São Paulo', zip: '01310-100' } },
  },
};

// Using getPathOr for a safe path read with fallback
const getCity = (userId: string): string =>
  getPathOr('Unknown city', ['profile', 'address', 'city'])(
    users[userId] ?? {},
  );

getCity('alice'); // 'São Paulo'
getCity('bob');   // 'Unknown city'

// Using Option for null-safe navigation with transformations
const formatCity = (userId: string): string =>
  pipe(
    fromNullable(users[userId]),
    mapOption(u => u.profile),
    mapOption(p => p?.address),
    mapOption(a => a?.city),
    unwrapOptionOr('Unknown city'),
  );

formatCity('alice'); // 'São Paulo'
formatCity('bob');   // 'Unknown city'
```

---

## 5. Collecting errors from parallel operations

**Use case:** Run multiple async operations concurrently and collect all failures instead of stopping at the first.

```typescript
import { mapAsyncResult, collectErrors, match } from '@roxdavirox/fp-core';
import { Ok, Err } from '@roxdavirox/fp-core';
import type { Result } from '@roxdavirox/fp-core';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface StockCheck {
  productId: string;
  available: boolean;
}

const checkStock = async (item: OrderItem): Promise<Result<StockCheck, string>> => {
  const stock = await fetch(`/api/stock/${item.productId}`).then(r => r.json() as Promise<{ available: boolean }>);
  return stock.available
    ? Ok({ productId: item.productId, available: true })
    : Err(`Product ${item.productId} is out of stock`);
};

const validateOrder = async (items: OrderItem[]) => {
  const results = await mapAsyncResult(checkStock)(items);

  return match(
    (checks: StockCheck[]) => ({
      valid: true as const,
      checks,
    }),
    (errors: string[]) => ({
      valid: false as const,
      errors,
    }),
  )(collectErrors(results));
};

// Usage
const order = [
  { productId: 'A1', quantity: 2 },
  { productId: 'B2', quantity: 1 },
  { productId: 'C3', quantity: 5 },
];

const validation = await validateOrder(order);
// { valid: false, errors: ['Product B2 is out of stock', 'Product C3 is out of stock'] }
```

---

## 6. Async retry pipeline

**Use case:** Fetch from an unstable API with automatic retries and exponential backoff.

```typescript
import { pipeAsync, retry, match } from '@roxdavirox/fp-core';
import { fromPromise } from '@roxdavirox/fp-core';

interface ApiResponse {
  data: unknown;
  status: number;
}

const fetchWithTimeout = async (url: string): Promise<ApiResponse> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), status: res.status };
  } finally {
    clearTimeout(timer);
  }
};

// Retry up to 3 times, starting with 500ms delay (doubles each attempt: 500, 1000, 2000)
const resilientFetch = retry(3, 500);

const callApi = async (endpoint: string) => {
  const result = await resilientFetch(() => fetchWithTimeout(endpoint));

  return match(
    (response: ApiResponse) => response.data,
    (error: Error) => {
      console.error(`All retries failed: ${error.message}`);
      return null;
    },
  )(result);
};

// Or compose into a full async pipeline
const processEndpoint = pipeAsync(
  (url: string) => retry(3, 500)(() => fetchWithTimeout(url)),
  result =>
    match(
      (r: ApiResponse) => Promise.resolve(r.data),
      (e: Error) => Promise.reject(e),
    )(result),
);
```

---

## 7. Option null-safe navigation

**Use case:** Chain optional property accesses through a deeply nested object without intermediate null checks.

```typescript
import { fromNullable, flatMapOption, mapOption, unwrapOptionOr } from '@roxdavirox/fp-core';
import { pipe } from '@roxdavirox/fp-core';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  name: string;
  coordinates?: Coordinates;
}

interface Event {
  title: string;
  location?: Location;
}

interface User {
  name: string;
  upcomingEvent?: Event;
}

const formatEventLocation = (user: User): string =>
  pipe(
    fromNullable(user.upcomingEvent),
    flatMapOption(event => fromNullable(event.location)),
    flatMapOption(location => fromNullable(location.coordinates)),
    mapOption(coords => `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`),
    unwrapOptionOr('Location unavailable'),
  );

// With full data
formatEventLocation({
  name: 'Alice',
  upcomingEvent: {
    title: 'Conference',
    location: {
      name: 'Convention Center',
      coordinates: { lat: -23.5505, lng: -46.6333 },
    },
  },
});
// '-23.5505, -46.6333'

// Missing at any level
formatEventLocation({ name: 'Bob' });
// 'Location unavailable'

formatEventLocation({ name: 'Carol', upcomingEvent: { title: 'Webinar' } });
// 'Location unavailable'
```

---

## 8. Concurrent processing with accumulated errors

**Use case:** Process a batch of items concurrently (bounded concurrency) and surface all failures.

```typescript
import { mapConcurrentResult, collectErrors, match } from '@roxdavirox/fp-core';
import { Ok, Err } from '@roxdavirox/fp-core';
import type { Result } from '@roxdavirox/fp-core';

interface Report {
  userId: string;
  month: string;
}

interface ReportResult {
  userId: string;
  url: string;
}

const generateReport = async (report: Report): Promise<Result<ReportResult, string>> => {
  try {
    const url = await fetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    }).then(r => r.json() as Promise<{ url: string }>).then(j => j.url);

    return Ok({ userId: report.userId, url });
  } catch (err) {
    return Err(`Failed to generate report for ${report.userId}: ${String(err)}`);
  }
};

const generateAllReports = async (reports: Report[]) => {
  // Process at most 3 concurrently
  const results = await mapConcurrentResult(3, generateReport)(reports);

  return match(
    (generated: ReportResult[]) => ({
      success: true as const,
      count: generated.length,
      urls: generated.map(r => r.url),
    }),
    (errors: string[]) => ({
      success: false as const,
      failedCount: errors.length,
      errors,
    }),
  )(collectErrors(results));
};
```

---

## 9. Data transformation pipeline

**Use case:** Transform raw API data through a series of pure functions using `pipe`, array utilities, and object utilities.

```typescript
import { pipe } from '@roxdavirox/fp-core';
import { map, filter, sortBy, groupBy } from '@roxdavirox/fp-core';
import { pick, mapValues } from '@roxdavirox/fp-core';

interface RawProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  internalCode: string;
}

interface ClientProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

type Catalog = Record<string, ClientProduct[]>;

const buildCatalog = (products: RawProduct[]): Catalog =>
  pipe(
    products,
    filter((p: RawProduct) => p.inStock),
    map((p: RawProduct): ClientProduct => pick(['id', 'name', 'price', 'category'])(p)),
    sortBy((p: ClientProduct) => p.price),
    groupBy((p: ClientProduct) => p.category),
  );

// Apply a discount to every price in the catalog
const applyDiscount = (pct: number) => (catalog: Catalog): Catalog =>
  mapValues(
    (products: ClientProduct[]) =>
      products.map(p => ({ ...p, price: +(p.price * (1 - pct / 100)).toFixed(2) })),
  )(catalog);

// Full pipeline
const clientCatalog = pipe(
  rawProducts,
  buildCatalog,
  applyDiscount(10), // 10% off
);
```

---

## 10. Config with defaults + validation

**Use case:** Merge user-supplied config over defaults, then validate the result.

```typescript
import { defaults, validateAll, match } from '@roxdavirox/fp-core';
import { Ok, Err } from '@roxdavirox/fp-core';
import type { Result } from '@roxdavirox/fp-core';

interface ServerConfig {
  host: string;
  port: number;
  maxConnections: number;
  timeout: number;
  debug: boolean;
}

const baseConfig: ServerConfig = {
  host: 'localhost',
  port: 3000,
  maxConnections: 100,
  timeout: 30_000,
  debug: false,
};

const isValidPort = (cfg: ServerConfig): Result<ServerConfig, string> =>
  cfg.port >= 1 && cfg.port <= 65535
    ? Ok(cfg)
    : Err(`Invalid port: ${cfg.port}`);

const isValidMaxConnections = (cfg: ServerConfig): Result<ServerConfig, string> =>
  cfg.maxConnections > 0
    ? Ok(cfg)
    : Err('maxConnections must be positive');

const isValidTimeout = (cfg: ServerConfig): Result<ServerConfig, string> =>
  cfg.timeout >= 1000
    ? Ok(cfg)
    : Err('timeout must be at least 1000ms');

const buildConfig = (partial: Partial<ServerConfig>) =>
  match(
    (cfg: ServerConfig) => cfg,
    (error: string) => {
      throw new Error(`Invalid config: ${error}`);
    },
  )(
    validateAll([isValidPort, isValidMaxConnections, isValidTimeout])(
      defaults(baseConfig)(partial),
    ),
  );

// Usage
buildConfig({ port: 8080 });
// ServerConfig { host: 'localhost', port: 8080, maxConnections: 100, timeout: 30000, debug: false }

buildConfig({ port: 0 });
// throws Error('Invalid config: Invalid port: 0')
```
