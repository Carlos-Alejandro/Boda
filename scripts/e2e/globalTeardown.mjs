import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const LOOPBACK = '127.0.0.1';
const API_ROOT = resolve(process.cwd(), '..', 'Boda-API');

export default async function globalTeardown() {
	const manifestPath = process.env.BODA_E2E_MANIFEST_PATH;
	if (!manifestPath) return;
	let manifest;
	try {
		manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
	} catch (error) {
		if (error?.code === 'ENOENT') return;
		throw error;
	}
	assert.equal(manifest.projectId, 'demo-boda', 'Refusing cleanup for a non-demo Firebase project');
	assert.ok(Array.isArray(manifest.displayNames) && manifest.displayNames.length === 2);

	for (const name of [
		'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT',
		'CLOUDSDK_CORE_PROJECT', 'NODE_OPTIONS', 'NODE_PATH', 'DOTENV_CONFIG_PATH',
	]) delete process.env[name];
	process.env.FIRESTORE_EMULATOR_HOST = `${LOOPBACK}:8080`;
	process.env.FIREBASE_AUTH_EMULATOR_HOST = `${LOOPBACK}:9099`;
	const apiRequire = createRequire(resolve(API_ROOT, 'package.json'));
	const { initializeApp } = apiRequire('firebase-admin/app');
	const { getFirestore } = apiRequire('firebase-admin/firestore');
	const app = initializeApp({ projectId: 'demo-boda' }, `boda-e2e-cleanup-${manifest.runId}`);
	try {
		const invitations = getFirestore(app).collection('invitations');
		for (const name of manifest.displayNames) {
			const matches = await invitations.where('displayName', '==', name).get();
			for (const document of matches.docs) await document.ref.delete();
		}
		for (const name of manifest.displayNames) {
			const leftovers = await invitations.where('displayName', '==', name).get();
			assert.equal(leftovers.size, 0, `E2E invitation cleanup failed for ${name}`);
		}
	} finally {
		await app.delete();
	}
	await rm(manifestPath, { force: true });
}
