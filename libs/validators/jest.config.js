module.exports = {
  displayName: "validators",
  preset: "../../jest.preset.js",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/libs/validators",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/examples.ts",
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|js)",
  ],
};
