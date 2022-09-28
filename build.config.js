import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VitePluginStyleInject from 'vite-plugin-style-inject';//第三方的小库，css 文件转 js 生成 <style> 标签。

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
        VitePluginStyleInject(),
    ],
})