/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Optional: Specify test file pattern
  // testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  // Optional: Setup files to run before tests
  // setupFilesAfterEnv: ['./src/setupTests.ts'], // Example setup file path
  // Optional: Module name mapper for path aliases like @/*
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1',
  // },
  // Clear mocks between tests
  clearMocks: true,
};
