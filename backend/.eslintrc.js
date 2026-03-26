module.exports = {
  root: true,
  extends: ['prettier', 'eslint:recommended', 'airbnb-base'],
  plugins: ['prettier'],
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'max-len': [2, 120, 4],
    'no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false
      }
    ],
    'prettier/prettier': 'error',
    radix: ['error', 'as-needed']
  }
};
