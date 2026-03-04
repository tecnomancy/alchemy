export default {
  // Run ESLint on staged TS source files
  'src/**/*.ts': [
    'eslint --max-warnings=0',
    // tsc ignores the file list — runs full project type-check
    () => 'tsc --noEmit',
  ],
};
