import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/post-deploy',
    timeout: 120_000,
    use: {
        baseURL: process.env.PRODUCTION_URL,
        browserName: 'chromium',
    },
});
