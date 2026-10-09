import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const chromePaths = [
	process.env.PLAYWRIGHT_EXECUTABLE_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean);
const chromePath = chromePaths.find(existsSync);
process.env.BODA_E2E_MANIFEST_PATH ??= join(tmpdir(), `boda-demo-e2e-${process.pid}.json`);
const resultDir = join(tmpdir(), `boda-playwright-results-${process.pid}`);

export default defineConfig({
	testDir: '.',
	testMatch: '**/*.spec.mjs',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	timeout: 90_000,
	globalTimeout: 180_000,
	reporter: 'list',
	globalSetup: './globalSetup.mjs',
	globalTeardown: './globalTeardown.mjs',
	use: {
		baseURL: 'http://127.0.0.1:5174',
		browserName: 'chromium',
		launchOptions: chromePath ? { executablePath: chromePath, headless: true } : { channel: 'chrome', headless: true },
		trace: 'retain-on-failure',
	},
	outputDir: resultDir,
});
