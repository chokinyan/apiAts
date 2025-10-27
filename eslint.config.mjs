import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    // Ignorer certains fichiers
    {
        ignores: ['node_modules/**', 'dist/**', 'download/**', '**/*.js', '**/*.d.ts']
    },
    
    // Configuration de base JavaScript
    js.configs.recommended,
    
    // Configuration pour TypeScript
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json'
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                setTimeout: 'readonly',
                document: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript,
            'prettier': prettier
        },
        rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            
            // Prettier integration
            'prettier/prettier': 'error',

            // TypeScript specific
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'off', // Peut causer des problèmes
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',

            // General code quality
            'no-console': 'off',
            'no-debugger': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-expressions': 'off', // Peut causer des problèmes avec await
            '@typescript-eslint/no-unused-vars': ['error', { 
                varsIgnorePattern: '^(Physique|GoogleDrive|MathCours|ElectricCours|MechanicCours|NodeJS|document|browser|inflight)$' 
            }]
    
        },
        ...prettierConfig
    }
];
