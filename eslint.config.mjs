import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Reglas base recomendadas de JS
    js.configs.recommended,

    // Reglas recomendadas de TypeScript
    ...tseslint.configs.recommended,

    {
        // A qué archivos aplica
        files: ['src/**/*.ts'],
        rules: {
            // Avisá (warning) si dejás un console.log olvidado
            'no-console': 'warn',
            // Error si declarás una variable y no la usás...
            '@typescript-eslint/no-unused-vars': [
                'error',
                // ...pero permitilo si el nombre empieza con _ (convención para "a propósito")
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },

    {
        // No linteamos lo compilado ni las dependencias
        ignores: ['dist', 'node_modules'],
    },
);