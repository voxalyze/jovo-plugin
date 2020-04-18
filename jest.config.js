module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
      babelConfig: true,
    },
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
