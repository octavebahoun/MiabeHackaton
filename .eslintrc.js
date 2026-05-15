module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // Autorise les types any pour la flexibilité en développement hackathon
    '@typescript-eslint/no-explicit-any': 'warn',
    // Autorise les interfaces vides (DTOs)
    '@typescript-eslint/no-empty-interface': 'warn',
    // Autorise les fonctions async sans await (stubs)
    '@typescript-eslint/require-await': 'off',
  },
};
