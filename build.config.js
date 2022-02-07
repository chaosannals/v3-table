import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src', 'all.js'),
            name: 'v3-table',
            fileName: mode => `v3-table.${mode}.js`,
        },
        rollupOptions: {
            external: ['vue', 'lodash'],
            output: {
                globals: {
                    vue: 'Vue',
                    lodash: '_',
                },
            },
        },
    },
    plugins: [
        vue(),
    ],
})