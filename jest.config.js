const pack = require('./package')

module.exports = {
  coveragePathIgnorePatterns: ['index.ts'],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  setupFiles: ['<rootDir>/../../jest/global-setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true, // comment out this and uncomment the line below to check for typescript errors
      // tsConfig: '<rootDir>/tsconfig.test.json',
    },
  },
  preset: 'ts-jest',
  displayName: pack.name,
  setupFilesAfterEnv: ['<rootDir>../../jest/setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>../../jest/cssTransform.js',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
}
