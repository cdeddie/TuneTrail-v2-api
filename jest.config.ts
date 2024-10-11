/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./jest.setup.ts'],
  testEnvironment: "node",
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      }
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};