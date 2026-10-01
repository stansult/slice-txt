import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testIgnore: '**/post-deploy/**',
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://127.0.0.1:4173',
    },
    projects: [
        {
            name: 'smoke-chromium',
            testMatch: '**/smoke.test.ts',
            use: { browserName: 'chromium' },
        },
        {
            name: 'smoke-mobile-chromium',
            testMatch: '**/smoke.test.ts',
            use: { ...devices['Pixel 7'] },
        },
        {
            name: 'chromium',
            testIgnore: ['**/post-deploy/**', '**/smoke.test.ts'],
            use: { browserName: 'chromium' },
            grepInvert: /@mobile\b/,
            dependencies: ['smoke-chromium'],
        },
        {
            name: 'mobile-chromium',
            testIgnore: ['**/post-deploy/**', '**/smoke.test.ts'],
            use: { ...devices['Pixel 7'] },
            grepInvert: /@desktop\b/,
            dependencies: ['smoke-mobile-chromium'],
        },
    ],
    webServer: {
        command: 'python3 -m http.server 4173 --bind 127.0.0.1 --directory site',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        stderr: 'ignore',
    },
});
