import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/agent'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/agent/**/*.spec.ts',
    '<rootDir>/agent/**/*.test.ts',
    '<rootDir>/agent/steps/**/*.spec.ts',
    '<rootDir>/agent/steps/**/*.test.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }]
  },
  moduleDirectories: ['node_modules', '<rootDir>/agent'],
  collectCoverageFrom: ['agent/**/*.ts', '!agent/**/*.d.ts'],
  coverageDirectory: '<rootDir>/coverage'
};

export default config;
