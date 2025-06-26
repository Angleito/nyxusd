const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  // Core Jest configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // TypeScript configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        ...compilerOptions,
        // Ensure ES modules are transpiled for Jest
        module: 'commonjs',
        target: 'es2020',
      },
    }],
  },
  
  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // Map @nyxusd/* paths from tsconfig
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),
    // Handle .js imports in TypeScript files
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Test discovery
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/libs/*/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/libs/*/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/packages/*/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/packages/*/src/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  
  // Test environment setup  
  // setupFilesAfterEnv will be configured per project
  
  // Coverage configuration
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'libs/*/src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/examples.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Performance and timeout
  slowTestThreshold: 5000,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Global configuration
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
  
  // Test execution
  maxWorkers: '50%',
  
  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/libs',
    '<rootDir>/packages',
    '<rootDir>/tests/utils',
  ],
  
  // Extensions to resolve
  resolver: undefined,
  
  // Watch configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
  
  // Custom matchers and utilities will be available globally
  testEnvironmentOptions: {},
};