import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJECT_ID = 'demo-boda';
const LOOPBACK = '127.0.0.1';
const FIRESTORE_URL = `http://${LOOPBACK}:8080`;
const AUTH_URL = `http://${LOOPBACK}:9099`;
const API_PORT = 3001;
const API_URL = `http://${LOOPBACK}:${API_PORT}`;
const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const API_ROOT = resolve(REPO_ROOT, '..', 'Boda-API');
const suiteId = randomUUID();
const createdIds = [];
const passed = [];
let adminToken;
let apiProcess;

function assertLoopback(url) {
	assert.equal(new URL(url).hostname, LOOPBACK, 'integration requests must use loopback only');
}

function localRequest(url, { method = 'GET', headers = {}, body } = {}) {
	assertLoopback(url);
	return new Promise((resolveRequest, reject) => {
		const parsed = new URL(url);
		const requestOptions = {
			hostname: parsed.hostname,
			port: Number(parsed.port),
			path: `${parsed.pathname}${parsed.search}`,
			method,
			headers: { ...headers },
		};
		if (body !== undefined) {
			requestOptions.headers['content-type'] = 'application/json';
			requestOptions.headers['content-length'] = Buffer.byteLength(body);
		}
		const outgoing = request(requestOptions, response => {
			const chunks = [];
			response.on('data', chunk => chunks.push(chunk));
			response.on('end', () => resolveRequest({
				status: response.statusCode ?? 0,
				text: Buffer.concat(chunks).toString('utf8'),
				headers: response.headers,
			}));
		});
		outgoing.on('error', reject);
		outgoing.setTimeout(5000, () => outgoing.destroy(new Error('local request timed out')));
		if (body !== undefined) outgoing.write(body);
		outgoing.end();
	});
}

async function jsonRequest(url, options) {
	const response = await localRequest(url, options);
	let value;
	try {
		value = response.text ? JSON.parse(response.text) : null;
	} catch {
		throw new Error(`expected JSON from ${new URL(url).pathname}`);
	}
	return { ...response, value };
}

function checkStatus(response, expected, label) {
	assert.equal(response.status, expected, `${label}: expected HTTP ${expected}, received ${response.status}`);
	return response.value;
}

async function runTest(name, callback) {
	await callback();
	passed.push(name);
	console.log(`PASS ${name}`);
}

function adminHeaders(extra = {}) {
	return { authorization: `Bearer ${adminToken}`, ...extra };
}

async function getInvitation(id) {
	return checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${encodeURIComponent(id)}`, {
		headers: adminHeaders(),
	}), 200, 'admin get invitation');
}

async function createInvitation(input) {
	const invitation = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations`, {
		method: 'POST',
		headers: adminHeaders(),
		body: JSON.stringify(input),
	}), 201, 'create invitation');
	createdIds.push(invitation.id);
	return invitation;
}

function expectedPublicState(invitation) {
	return JSON.stringify({
		id: invitation.id,
		maxGuests: invitation.maxGuests,
		replacementsAllowed: invitation.replacementsAllowed,
		isArchived: invitation.isArchived,
		archivedAt: invitation.archivedAt === null ? null : Date.parse(invitation.archivedAt),
		editOverrideUntil: invitation.editOverrideUntil === null ? null : Date.parse(invitation.editOverrideUntil),
		rsvpStatus: invitation.rsvpStatus,
		message: invitation.message,
		guests: invitation.guests.map(({ name, shortName, type, attending, originalName }) =>
			[name, shortName, type, attending, originalName ?? null]),
	});
}

async function submitRsvp(invitation, values) {
	return jsonRequest(`${API_URL}/api/public/invitations/${encodeURIComponent(invitation.id)}/rsvp`, {
		method: 'POST',
		body: JSON.stringify({
			expectedState: expectedPublicState(invitation),
			responses: values.responses,
			replacementNames: values.replacementNames,
			openGuestNames: values.openGuestNames,
			message: values.message ?? '',
			...(values.declineAll ? { declineAll: true } : {}),
		}),
	});
}

async function waitForApi() {
	const until = Date.now() + 15_000;
	while (Date.now() < until) {
		if (apiProcess?.exitCode !== null) throw new Error('isolated API test process exited during startup');
		try {
			const health = await jsonRequest(`${API_URL}/api/health`);
			if (health.status === 200 && health.value?.service === 'boda-api') return;
		} catch {
			// The isolated server may need a short moment to bind its loopback port.
		}
		await new Promise(resolveWait => setTimeout(resolveWait, 200));
	}
	throw new Error('isolated API did not become healthy on 127.0.0.1:3001');
}

async function ensureTestPortFree() {
	const server = createServer();
	await new Promise((resolveListen, rejectListen) => {
		server.once('error', rejectListen);
		server.listen(API_PORT, LOOPBACK, resolveListen);
	});
	await new Promise((resolveClose, rejectClose) => server.close(error => error ? rejectClose(error) : resolveClose()));
}

async function removeTestData() {
	const errors = [];
	if (createdIds.length) {
		let adminApp;
		try {
			for (const name of [
				'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT',
				'CLOUDSDK_CORE_PROJECT',
			]) delete process.env[name];
			process.env.FIRESTORE_EMULATOR_HOST = `${LOOPBACK}:8080`;
			process.env.FIREBASE_AUTH_EMULATOR_HOST = `${LOOPBACK}:9099`;
			const apiRequire = createRequire(resolve(API_ROOT, 'package.json'));
			const { initializeApp } = apiRequire('firebase-admin/app');
			const { getFirestore } = apiRequire('firebase-admin/firestore');
			adminApp = initializeApp({ projectId: PROJECT_ID }, `boda-emulator-cleanup-${suiteId}`);
			const db = getFirestore(adminApp);
			for (const id of createdIds) await db.collection('invitations').doc(id).delete();
			for (const id of createdIds) {
				if ((await db.collection('invitations').doc(id).get()).exists) {
					errors.push(`this run's emulator invitation ${id} still exists after cleanup`);
				}
			}
			await adminApp.delete();
			adminApp = undefined;
		} catch {
			errors.push('could not safely remove and verify this run\'s Firestore Emulator invitations');
			if (adminApp) await adminApp.delete().catch(() => {});
		}
	}
	if (adminToken) {
		try {
			const response = await jsonRequest(`${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-api-key`, {
				method: 'POST',
				body: JSON.stringify({ idToken: adminToken }),
			});
			if (response.status !== 200) {
				errors.push(`could not remove this run's emulator Auth account (HTTP ${response.status})`);
			}
		} catch {
			errors.push('could not reach Auth Emulator to remove this run\'s account');
		}
	}
	if (errors.length) throw new Error(errors.join('; '));
}

async function main() {
	await ensureTestPortFree();
	const firebaseConfig = JSON.parse(await readFile(resolve(REPO_ROOT, 'firebase.json'), 'utf8'));
	assert.equal(firebaseConfig.emulators.firestore.host, LOOPBACK);
	assert.equal(firebaseConfig.emulators.firestore.port, 8080);
	assert.equal(firebaseConfig.emulators.auth.host, LOOPBACK);
	assert.equal(firebaseConfig.emulators.auth.port, 9099);
	assert.equal(firebaseConfig.emulators.ui.host, LOOPBACK);
	assert.equal(firebaseConfig.emulators.ui.port, 4000);

	const [firestoreHealth, authHealth] = await Promise.all([
		localRequest(`${FIRESTORE_URL}/`),
		localRequest(`${AUTH_URL}/emulator/v1/projects/${PROJECT_ID}/config`),
	]);
	assert.equal(firestoreHealth.status, 200, 'Firestore Emulator must answer on loopback');
	assert.equal(authHealth.status, 200, 'Auth Emulator must answer for demo-boda');

	const key = suiteId;
	const email = `boda-e2e-${key}@example.test`;
	const password = `Emulator-${randomUUID()}-Only!`;
	const signup = checkStatus(await jsonRequest(
		`${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,
		{ method: 'POST', body: JSON.stringify({ email, password, returnSecureToken: true }) },
	), 200, 'create isolated Auth Emulator account');
	assert.equal(typeof signup.localId, 'string');
	adminToken = signup.idToken;
	assert.equal(typeof adminToken, 'string');

	const apiEnv = { ...process.env };
	for (const name of [
		'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT',
		'CLOUDSDK_CORE_PROJECT', 'NODE_OPTIONS', 'NODE_PATH', 'DOTENV_CONFIG_PATH', 'DOTENV_CONFIG_OVERRIDE',
	]) delete apiEnv[name];
	Object.assign(apiEnv, {
		NODE_ENV: 'development',
		USE_FIREBASE_EMULATORS: 'true',
		FIREBASE_PROJECT_ID: PROJECT_ID,
		FIRESTORE_EMULATOR_HOST: `${LOOPBACK}:8080`,
		FIREBASE_AUTH_EMULATOR_HOST: `${LOOPBACK}:9099`,
		ADMIN_FIREBASE_UIDS: signup.localId,
		CORS_ALLOWED_ORIGINS: 'http://127.0.0.1:5173,http://127.0.0.1:5174',
		PORT: String(API_PORT),
	});
	const tsxDir = resolve(API_ROOT, 'node_modules', 'tsx', 'dist');
	apiProcess = spawn(process.execPath, [
		'--require', resolve(tsxDir, 'preflight.cjs'),
		'--import', pathToFileURL(resolve(tsxDir, 'loader.mjs')).href,
		'src/server.ts',
	], { cwd: API_ROOT, env: apiEnv, stdio: 'ignore' });
	apiProcess.on('error', error => console.error(`isolated API process error: ${error.message}`));

	try {
		await waitForApi();
		await runTest('admin authorization uses only the new Auth Emulator user', async () => {
			checkStatus(await jsonRequest(`${API_URL}/api/admin/health`), 401, 'admin health without token');
			checkStatus(await jsonRequest(`${API_URL}/api/admin/health`, { headers: adminHeaders() }), 200, 'admin health with emulator token');
		});

		await runTest('invalid admin creation is rejected without adding a test invitation', async () => {
			const response = await jsonRequest(`${API_URL}/api/admin/invitations`, {
				method: 'POST', headers: adminHeaders(), body: JSON.stringify({ displayName: '', knownGuests: [], openSlots: 0, replacementsAllowed: true }),
			});
			assert.equal(response.status, 400);
		});

		const known = await createInvitation({
			displayName: `Integration known ${key.slice(0, 8)}`,
			knownGuests: [{ name: `Juan ${key.slice(0, 8)}` }, { name: `Ana ${key.slice(0, 8)}` }],
			openSlots: 1,
			replacementsAllowed: true,
		});
		await runTest('invitation creation persists to Firestore Emulator and is publicly readable by its link', async () => {
			assert.equal(known.rsvpStatus, 'pending');
			const stored = await localRequest(`${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/invitations/${known.id}`);
			assert.equal(stored.status, 200, 'public Firestore document get should follow the emulator rules');
			const publicPage = await localRequest(`http://${LOOPBACK}:5173/invitacion/${known.id}`);
			assert.equal(publicPage.status, 200, 'Boda public invitation route should serve its app shell');
			const adminPage = await localRequest(`http://${LOOPBACK}:5174/invitaciones/${known.id}`);
			assert.equal(adminPage.status, 200, 'Boda-Admin invitation route should serve its app shell');
		});

		await runTest('RSVP confirmation leaves an extra open place unassigned and matches the admin read', async () => {
			const current = await getInvitation(known.id);
			const response = checkStatus(await submitRsvp(current, {
				responses: [true, true, null], replacementNames: ['', '', ''], openGuestNames: ['', '', ''],
			}), 200, 'public RSVP confirmation');
			assert.equal(response.rsvpStatus, 'confirmed');
			assert.equal(response.guests.filter(guest => guest.attending === true).length, 2);
			assert.equal(response.guests[2].name, '');
			assert.equal(response.guests[2].type, 'open');
			const adminRead = await getInvitation(known.id);
			assert.equal(adminRead.rsvpStatus, response.rsvpStatus);
			assert.deepEqual(adminRead.guests, response.guests);
		});

		const openOnly = await createInvitation({
			displayName: `Integration open ${key.slice(0, 8)}`,
			knownGuests: [], openSlots: 2, replacementsAllowed: true,
		});
		await runTest('explicit decline and capacity/archive operations preserve open slots and state', async () => {
			const declined = checkStatus(await submitRsvp(openOnly, {
				responses: [null, null], replacementNames: ['', ''], openGuestNames: ['', ''], declineAll: true,
			}), 200, 'explicit open-only decline');
			assert.equal(declined.rsvpStatus, 'declined');
			assert.ok(declined.guests.every(guest => guest.type === 'open' && guest.name === ''));
			const expanded = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${openOnly.id}/capacity`, {
				method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ maxGuests: 3 }),
			}), 200, 'increase invitation capacity');
			assert.equal(expanded.maxGuests, 3);
			assert.equal(expanded.rsvpStatus, 'declined');
			const reduced = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${openOnly.id}/capacity`, {
				method: 'PATCH', headers: adminHeaders(), body: JSON.stringify({ maxGuests: 2 }),
			}), 200, 'reduce invitation capacity');
			assert.equal(reduced.maxGuests, 2);
			assert.equal(reduced.rsvpStatus, 'declined');
			const archived = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${openOnly.id}/archive`, {
				method: 'POST', headers: adminHeaders(), body: '{}',
			}), 200, 'archive invitation');
			assert.equal(archived.isArchived, true);
			const unavailable = await submitRsvp(archived, {
				responses: [null, null], replacementNames: ['', ''], openGuestNames: ['', ''], declineAll: true,
			});
			assert.equal(unavailable.status, 409);
			const restored = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${openOnly.id}/restore`, {
				method: 'POST', headers: adminHeaders(), body: '{}',
			}), 200, 'restore archived invitation');
			assert.equal(restored.isArchived, false);
			assert.equal(restored.rsvpStatus, 'declined');
		});

		const replacement = await createInvitation({
			displayName: `Integration restore ${key.slice(0, 8)}`,
			knownGuests: [{ name: `Original ${key.slice(0, 8)}` }],
			openSlots: 0, replacementsAllowed: true,
		});
		await runTest('replacement restoration returns original unanswered, then accepts a later confirmation', async () => {
			let current = await getInvitation(replacement.id);
			const substituted = checkStatus(await submitRsvp(current, {
				responses: [false], replacementNames: [`Replacement ${key.slice(0, 8)}`], openGuestNames: [''],
			}), 200, 'submit replacement');
			assert.equal(substituted.guests[0].type, 'replacement');
			assert.equal(substituted.guests[0].attending, true);

			current = await getInvitation(replacement.id);
			const restored = checkStatus(await submitRsvp(current, {
				responses: [null], replacementNames: [''], openGuestNames: [''],
			}), 200, 'restore original through RSVP');
			assert.equal(restored.guests[0].name, `Original ${key.slice(0, 8)}`);
			assert.equal(restored.guests[0].type, 'known');
			assert.equal(restored.guests[0].attending, null);
			assert.equal(restored.maxGuests, 1);
			assert.equal(restored.rsvpStatus, 'pending');
			assert.equal((await getInvitation(replacement.id)).rsvpStatus, 'pending');

			current = await getInvitation(replacement.id);
			const confirmed = checkStatus(await submitRsvp(current, {
				responses: [true], replacementNames: [''], openGuestNames: [''],
			}), 200, 'confirm after restore');
			assert.equal(confirmed.guests[0].attending, true);
			assert.equal(confirmed.rsvpStatus, 'confirmed');
		});

		const knownDecline = await createInvitation({
			displayName: `Integration decline ${key.slice(0, 8)}`,
			knownGuests: [{ name: `Decline ${key.slice(0, 8)}` }], openSlots: 0, replacementsAllowed: false,
		});
		await runTest('known guest can explicitly decline without being represented as a replacement', async () => {
			const response = checkStatus(await submitRsvp(knownDecline, {
				responses: [false], replacementNames: [''], openGuestNames: [''],
			}), 200, 'known guest decline');
			assert.equal(response.rsvpStatus, 'declined');
			assert.equal(response.guests[0].type, 'known');
			assert.equal(response.guests[0].attending, false);
		});

		const adminRestore = await createInvitation({
			displayName: `Integration admin restore ${key.slice(0, 8)}`,
			knownGuests: [{ name: `Admin original ${key.slice(0, 8)}` }], openSlots: 0, replacementsAllowed: true,
		});
		await runTest('administrative replacement restoration preserves null response and version protection', async () => {
			checkStatus(await submitRsvp(adminRestore, {
				responses: [false], replacementNames: [`Admin replacement ${key.slice(0, 8)}`], openGuestNames: [''],
			}), 200, 'create replacement before admin restore');
			const beforeRestore = await getInvitation(adminRestore.id);
			const restored = checkStatus(await jsonRequest(`${API_URL}/api/admin/invitations/${adminRestore.id}/guests/0/restore-replacement`, {
				method: 'POST',
				headers: adminHeaders({ 'x-invitation-version': beforeRestore.version }),
				body: '{}',
			}), 200, 'admin restore replacement');
			assert.equal(restored.guests[0].name, `Admin original ${key.slice(0, 8)}`);
			assert.equal(restored.guests[0].attending, null);
			assert.equal(restored.rsvpStatus, 'pending');
			const stale = await jsonRequest(`${API_URL}/api/admin/invitations/${adminRestore.id}/guests/0/restore-replacement`, {
				method: 'POST',
				headers: adminHeaders({ 'x-invitation-version': beforeRestore.version }),
				body: '{}',
			});
			assert.equal(stale.status, 412);
			assert.equal((await getInvitation(adminRestore.id)).rsvpStatus, 'pending');
		});

		await runTest('declineAll and unauthorized-origin requests are rejected for named invitations', async () => {
			const current = await getInvitation(known.id);
			const badDecline = await submitRsvp(current, {
				responses: [null, null], replacementNames: ['', ''], openGuestNames: ['', ''], declineAll: true,
			});
			assert.equal(badDecline.status, 400);
			assert.equal((await getInvitation(known.id)).rsvpStatus, 'confirmed');
			const forbiddenOrigin = await jsonRequest(`${API_URL}/api/admin/health`, {
				headers: adminHeaders({ origin: 'https://production.example.test' }),
			});
			assert.equal(forbiddenOrigin.status, 403);
		});
	} finally {
		if (apiProcess && apiProcess.exitCode === null) {
			apiProcess.kill('SIGTERM');
			await Promise.race([once(apiProcess, 'exit'), new Promise(resolveWait => setTimeout(resolveWait, 3000))]);
		}
		await removeTestData();
	}

	console.log(`Completed ${passed.length} local API/Firestore Emulator integration checks; test data and Auth Emulator user removed.`);
}

main().catch(error => {
	console.error(`Local Emulator integration failed: ${error.message}`);
	process.exitCode = 1;
});
