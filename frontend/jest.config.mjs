const config = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    testMatch: ["<rootDir>/test/**/*.test.{js,jsx}"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
    },
    collectCoverageFrom: [
        "src/services/**/*.{js,jsx}",
        "src/utils/**/*.{js,jsx}",
        "!src/services/useFichasDia.js",
    ],
    coverageDirectory: "<rootDir>/test-reports/jest/coverage",
    coverageReporters: ["text", "text-summary", "html", "json", "lcov"],
};

export default config;
