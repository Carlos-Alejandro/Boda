import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const LOOPBACK = '127.0.0.1';
const PROJECT_ID = 'demo-boda';
const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const API_ROOT = resolve(ROOT, '..', 'Boda-API');

function localUrl(value) {
	const url = new URL(value);
	assert.equal(url.hostname, LOOPBACK, 'E2E preflight requests must use loopback only');
	return url;
}

async function expectLocal(url, status = 200) {
	const parsed = localUrl(url);
	const response = await fetch(parsed, { signal: AbortSignal.timeout(4000) });
	assert.equal(response.status, status, `${parsed.pathname} returned HTTP ${response.status}`);
	return response;
}

export default async function globalSetup() {
	const manifestPath = process.env.BODA_E2E_MANIFEST_PATH;
	assert.ok(manifestPath, 'Playwright cleanup manifest path is missing');
	const firebase = JSON.parse(await readFile(resolve(ROOT, 'firebase.json'), 'utf8'));
	assert.deepEqual(firebase.emulators.auth, { host: LOOPBACK, port: 9099 });
	assert.deepEqual(firebase.emulators.firestore, { host: LOOPBACK, port: 8080 });
	assert.equal(firebase.emulators.ui.host, LOOPBACK);
	assert.equal(firebase.emulators.ui.port, 4000);
	for (const service of ['database', 'functions', 'storage', 'pubsub', 'eventarc']) {
		assert.equal(firebase.emulators[service], undefined, `Unexpected Firebase ${service} emulator configuration`);
	}

	await Promise.all([
		expectLocal('http://127.0.0.1:8080/'),
		expectLocal('http://127.0.0.1:9099/emulator/v1/projects/demo-boda/config'),
		expectLocal('http://127.0.0.1:4000/'),
		expectLocal('http://127.0.0.1:3000/api/health'),
	]);
	for (const key of [
		'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT',
		'CLOUDSDK_CORE_PROJECT', 'NODE_OPTIONS', 'NODE_PATH', 'DOTENV_CONFIG_PATH',
	]) delete process.env[key];
	process.env.FIRESTORE_EMULATOR_HOST = `${LOOPBACK}:8080`;
	process.env.FIREBASE_AUTH_EMULATOR_HOST = `${LOOPBACK}:9099`;
	const apiRequire = createRequire(resolve(API_ROOT, 'package.json'));
	const { initializeApp } = apiRequire('firebase-admin/app');
	const { getFirestore } = apiRequire('firebase-admin/firestore');
	const probeApp = initializeApp({ projectId: PROJECT_ID }, `boda-e2e-firestore-preflight-${randomUUID()}`);
	try {
		assert.equal(probeApp.options.projectId, PROJECT_ID);
		const probe = await getFirestore(probeApp).collection('e2ePreflightChecks').doc(randomUUID()).get();
		assert.equal(probe.exists, false, 'Firestore Emulator read probe unexpectedly found a document');
	} finally {
		await probeApp.delete();
	}

	const [publicFirebase, adminFirebase, adminAuthConfig] = await Promise.all([
		expectLocal('http://127.0.0.1:5173/src/firebase/firebase.ts'),
		expectLocal('http://127.0.0.1:5174/src/config/env.ts'),
		expectLocal('http://127.0.0.1:5174/src/config/firebase.ts'),
	]);
	const publicConfig = await publicFirebase.text();
	const adminConfig = await adminFirebase.text();
	const adminFirebaseConfig = await adminAuthConfig.text();
	for (const [label, source] of [['Boda', publicConfig], ['Boda-Admin', adminConfig]]) {
		assert.match(source, /VITE_USE_FIREBASE_EMULATORS":\s*"true"/, `${label} is not running in emulator mode`);
		assert.match(source, /VITE_FIREBASE_PROJECT_ID":\s*"demo-boda"/, `${label} is not using demo-boda`);
	}
	assert.match(publicConfig, /connectFirestoreEmulator\(db, "127\.0\.0\.1", 8080\)/);
	assert.match(publicConfig, /VITE_API_BASE_URL":\s*"http:\/\/127\.0\.0\.1:3000"/);
	assert.match(adminFirebaseConfig, /connectAuthEmulator\(auth, "http:\/\/127\.0\.0\.1:9099"\)/);
	assert.match(adminConfig, /VITE_API_BASE_URL":\s*"http:\/\/127\.0\.0\.1:3000"/);
	assert.match(adminConfig, /VITE_PUBLIC_INVITATION_BASE_URL":\s*"http:\/\/127\.0\.0\.1:5173"/);

	const runId = randomUUID();
	await writeFile(manifestPath, JSON.stringify({
		projectId: PROJECT_ID,
		runId,
		displayNames: [`E2E ${runId} restauración`, `E2E ${runId} rechazo`],
	}), { encoding: 'utf8', flag: 'wx' });
}
