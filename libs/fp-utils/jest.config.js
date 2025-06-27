module.exports = {
  displayName: "fp-utils",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/libs/fp-utils",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/index.ts",
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|js)",
  ],
};
