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
};

export default config;
