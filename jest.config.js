const baseConfig = require("./jest.preset.js");

module.exports = {
  ...baseConfig,

  // Projects configuration for monorepo
  projects: [
    // Individual package configurations
    "<rootDir>/libs/validators/jest.config.js",
    "<rootDir>/libs/fp-utils/jest.config.js",
    // Add other packages as they're created

    // Global test suites
    {
      displayName: "unit-tests",
      ...baseConfig,
      testMatch: ["<rootDir>/tests/unit/**/*.(test|spec).(ts|tsx)"],
      coverageDirectory: "<rootDir>/coverage/unit",
      setupFilesAfterEnv: ["<rootDir>/tests/utils/simple-setup.ts"],
    },
    {
      displayName: "integration-tests",
      ...baseConfig,
      testMatch: ["<rootDir>/tests/integration/**/*.(test|spec).(ts|tsx)"],
      coverageDirectory: "<rootDir>/coverage/integration",
    },
    {
      displayName: "property-tests",
      ...baseConfig,
      testMatch: ["<rootDir>/tests/property/**/*.(test|spec).(ts|tsx)"],
      coverageDirectory: "<rootDir>/coverage/property",
    },
  ],

  // Global configuration overrides
  coverageDirectory: "<rootDir>/coverage/global",

  // Reporters for different output formats
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "<rootDir>/coverage",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: "<rootDir>/coverage/html-report",
        filename: "report.html",
        expand: true,
      },
    ],
  ],

  // Additional global settings
  watchman: true,
  passWithNoTests: true,

  // For CI/CD environments
  ci: process.env.CI === "true",
  forceExit: true,
  detectOpenHandles: true,
};
