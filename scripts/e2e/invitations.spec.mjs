import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const LOOPBACK = '127.0.0.1';
const API_ROOT = resolve(process.cwd(), '..', 'Boda-API');
const API_URL = 'http://127.0.0.1:3000';
const ADMIN_URL = 'http://127.0.0.1:5174';
const PUBLIC_URL = 'http://127.0.0.1:5173';
const AUTH_URL = 'http://127.0.0.1:9099';

function assertLoopback(value) {
	assert.equal(new URL(value).hostname, LOOPBACK, 'E2E requests are restricted to loopback');
}

async function emulatorAdminSession() {
	for (const key of [
		'GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT',
		'CLOUDSDK_CORE_PROJECT', 'NODE_OPTIONS', 'NODE_PATH', 'DOTENV_CONFIG_PATH',
	]) delete process.env[key];
	process.env.FIREBASE_AUTH_EMULATOR_HOST = `${LOOPBACK}:9099`;
	process.env.FIRESTORE_EMULATOR_HOST = `${LOOPBACK}:8080`;

	const apiRequire = createRequire(resolve(API_ROOT, 'package.json'));
	const { initializeApp } = apiRequire('firebase-admin/app');
	const { getAuth } = apiRequire('firebase-admin/auth');
	const app = initializeApp({ projectId: 'demo-boda' }, `boda-e2e-auth-${process.pid}`);
	try {
		const emulatorAuth = getAuth(app);
		const { users } = await emulatorAuth.listUsers(1000);
		for (const user of users) {
			const google = user.providerData.find(provider => provider.providerId === 'google.com');
			if (!google || !user.email) continue;
			const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
			const now = Math.floor(Date.now() / 1000);
			const providerToken = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
				iss: 'https://accounts.google.com', aud: 'demo-api-key', sub: google.uid,
				email: user.email, email_verified: true, iat: now, exp: now + 300,
			})}.`;
			const signInUrl = `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-api-key`;
			assertLoopback(signInUrl);
			const signIn = await fetch(signInUrl, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					requestUri: `${ADMIN_URL}/__/auth/handler`,
					postBody: new URLSearchParams({ providerId: 'google.com', id_token: providerToken }).toString(),
					returnSecureToken: true,
					returnIdpCredential: true,
				}),
				signal: AbortSignal.timeout(5000),
			});
			if (!signIn.ok) continue;
			const authTokens = await signIn.json();
			if (authTokens.localId !== user.uid || typeof authTokens.idToken !== 'string') continue;

			const healthUrl = `${API_URL}/api/admin/health`;
			assertLoopback(healthUrl);
			const health = await fetch(healthUrl, {
				headers: { authorization: `Bearer ${authTokens.idToken}` },
				signal: AbortSignal.timeout(5000),
			});
			if (health.status === 200) return { uid: user.uid, idToken: authTokens.idToken };
		}
		throw new Error('No hay una cuenta Google de Auth Emulator autorizada por la API local; se detiene antes de crear invitaciones.');
	} finally {
		await app.delete();
	}
}

async function apiInvitation(page, id) {
	return page.evaluate(async invitationId => {
		const authModule = await import('/node_modules/.vite/deps/firebase_auth.js');
		const appModule = await import('/node_modules/.vite/deps/firebase_app.js');
		const token = await authModule.getAuth(appModule.getApp()).currentUser.getIdToken();
		const response = await fetch(`http://127.0.0.1:3000/api/admin/invitations/${encodeURIComponent(invitationId)}`, {
			headers: { authorization: `Bearer ${token}` },
		});
		return { status: response.status, invitation: await response.json() };
	}, id);
}

async function createInvitation(page, { displayName, guestName, openSlots, replacementsAllowed }) {
	await page.goto(`${ADMIN_URL}/invitaciones/nueva`);
	await page.getByLabel('Nombre de la invitación').fill(displayName);
	if (guestName) {
		await page.getByRole('button', { name: /Agregar persona/ }).click();
		await page.getByRole('textbox', { name: 'Nombre de la persona 1' }).fill(guestName);
	}
	await page.getByLabel('Lugares adicionales').fill(String(openSlots));
	if (replacementsAllowed) await page.getByRole('checkbox', { name: 'Permitir sustituciones' }).check();
	const createdResponse = page.waitForResponse(response =>
		new URL(response.url()).pathname === '/api/admin/invitations' && response.request().method() === 'POST',
	);
	await page.getByRole('button', { name: 'Crear invitación' }).click();
	const response = await createdResponse;
	expect(response.status()).toBe(201);
	const invitation = await response.json();
	assert.equal(invitation.displayName, displayName);
	return invitation;
}

test('recorridos visibles de creación, RSVP, sustitución y restauración', async ({ browser }) => {
	const manifest = JSON.parse(await readFile(process.env.BODA_E2E_MANIFEST_PATH, 'utf8'));
	const [restoreName, declineName] = manifest.displayNames;
	const guestName = `Juan ${manifest.runId.slice(0, 8)}`;
	const substituteName = `María ${manifest.runId.slice(0, 8)}`;
	const authSession = await emulatorAdminSession();
	const context = await browser.newContext();
	const blockedExternalOrigins = new Set();
	await context.route('**/*', async route => {
		const url = new URL(route.request().url());
		if (url.protocol === 'data:' || url.protocol === 'blob:' || ['127.0.0.1', 'localhost'].includes(url.hostname)) {
			return route.continue();
		}
		blockedExternalOrigins.add(url.origin);
		return route.abort();
	});

	try {
		const adminPage = await context.newPage();
		await adminPage.goto(`${ADMIN_URL}/login`);
		const browserUid = await adminPage.evaluate(async idToken => {
			const authModule = await import('/node_modules/.vite/deps/firebase_auth.js');
			const appModule = await import('/node_modules/.vite/deps/firebase_app.js');
			const auth = authModule.getAuth(appModule.getApp());
			const credential = authModule.GoogleAuthProvider.credential(idToken);
			const result = await authModule.signInWithCredential(auth, credential);
			return result.user.uid;
		}, authSession.idToken);
		assert.equal(browserUid, authSession.uid);
		await expect(adminPage.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();

		let invitationId;
		await test.step('crear invitación desde Admin y verificarla en el listado', async () => {
			const invitation = await createInvitation(adminPage, {
				displayName: restoreName,
				guestName,
				openSlots: 1,
				replacementsAllowed: true,
			});
			invitationId = invitation.id;
			const stored = await apiInvitation(adminPage, invitationId);
			expect(stored.status).toBe(200);
			expect(stored.invitation.rsvpStatus).toBe('pending');
			expect(stored.invitation.maxGuests).toBe(2);

			const apiRequire = createRequire(resolve(API_ROOT, 'package.json'));
			const { initializeApp } = apiRequire('firebase-admin/app');
			const { getFirestore } = apiRequire('firebase-admin/firestore');
			const firestoreApp = initializeApp({ projectId: 'demo-boda' }, `boda-e2e-persist-${manifest.runId}`);
			try {
				const document = await getFirestore(firestoreApp).collection('invitations').doc(invitationId).get();
				expect(document.exists).toBe(true);
				expect(document.get('displayName')).toBe(restoreName);
			} finally {
				await firestoreApp.delete();
			}

			await adminPage.getByRole('dialog').getByRole('button', { name: 'Cerrar' }).click();
			await adminPage.getByRole('link', { name: 'Todas', exact: true }).click();
			const search = adminPage.getByRole('searchbox', { name: 'Buscar invitaciones' });
			await search.fill(restoreName);
			const listedInvitation = adminPage.getByRole('link', { name: restoreName, exact: true });
			await expect(listedInvitation).toBeVisible();
			await listedInvitation.click();
			await expect(adminPage.getByRole('group', { name: 'Resumen de asistencia' })).toContainText('2 lugares en total');
		});

		const publicPage = await context.newPage();
		await publicPage.setViewportSize({ width: 390, height: 844 });
		await publicPage.goto(`${PUBLIC_URL}/invitacion/${encodeURIComponent(invitationId)}`);
		await publicPage.getByRole('button', { name: 'Comenzar' }).click();
		await expect(publicPage.getByRole('heading', { name: /qui[eé]nes nos acompa[nñ]ar[aá]n/i })).toBeVisible();
		const guestRow = publicPage.getByRole('listitem').filter({ hasText: guestName });

		await test.step('confirmar asistencia y comprobar estado y capacidad en Admin', async () => {
			await guestRow.getByRole('button', { name: 'Sí' }).click();
			await publicPage.getByRole('button', { name: 'Confirmar asistencia' }).click();
			await expect(publicPage.getByRole('status').filter({ hasText: 'Tu respuesta se guardó correctamente.' })).toBeVisible();
			const stored = await apiInvitation(adminPage, invitationId);
			expect(stored.invitation.rsvpStatus).toBe('confirmed');
			expect(stored.invitation.guests.filter(guest => guest.attending === true)).toHaveLength(1);
			expect(stored.invitation.guests[1]).toMatchObject({ type: 'open', name: '' });
			expect(stored.invitation.guests[1].attending).not.toBe(true);

			await adminPage.reload();
			await expect(adminPage.getByText('Confirmada', { exact: true })).toBeVisible();
			const summary = adminPage.getByRole('group', { name: 'Resumen de asistencia' });
			await expect(summary).toContainText('2 lugares en total');
			await expect(summary).toContainText('1 asistirá');
			await expect(summary).toContainText('1 lugar libre');
			const openPlace = adminPage.getByRole('listitem').filter({ hasText: 'Lugar sin asignar' });
			await expect(openPlace).toBeVisible();
			await expect(openPlace).not.toContainText('No asiste');
		});

		await test.step('sustituir al invitado original desde el formulario público', async () => {
			await guestRow.getByRole('button', { name: 'No' }).click();
			await guestRow.getByRole('button', { name: 'Agregar reemplazo' }).click();
			await publicPage.getByRole('textbox', { name: 'Nombre del reemplazo' }).fill(substituteName);
			await publicPage.getByRole('button', { name: 'Listo' }).click();
			await publicPage.getByRole('button', { name: 'Actualizar asistencia' }).click();
			const stored = await apiInvitation(adminPage, invitationId);
			expect(stored.invitation.guests[0]).toMatchObject({ type: 'replacement', name: substituteName, originalName: guestName, attending: true });
			expect(stored.invitation.maxGuests).toBe(2);
			await adminPage.reload();
			await expect(adminPage.getByText(substituteName, { exact: true })).toBeVisible();
			await expect(adminPage.getByText(`Invitado original: ${guestName}`, { exact: true })).toBeVisible();
		});

		await test.step('restaurar al invitado original con asistencia pendiente y mensaje contextual', async () => {
			await publicPage.getByRole('button', { name: 'Restaurar invitado original' }).click();
			await publicPage.getByRole('button', { name: 'Actualizar asistencia' }).click();
			await expect(publicPage.getByRole('status').filter({ hasText: 'Se restauró al invitado original. Su asistencia quedó pendiente de confirmación.' })).toBeVisible();
			await expect(publicPage.getByRole('status').filter({ hasText: 'Tu respuesta se guardó correctamente.' })).toHaveCount(0);
			const stored = await apiInvitation(adminPage, invitationId);
			expect(stored.invitation.guests[0]).toMatchObject({ type: 'known', name: guestName, attending: null });
			expect(stored.invitation.guests[1]).toMatchObject({ type: 'open', name: '' });
			expect(stored.invitation.guests[1].attending).not.toBe(true);
			expect(stored.invitation.rsvpStatus).toBe('pending');
			expect(stored.invitation.maxGuests).toBe(2);

			await adminPage.reload();
			await expect(adminPage.getByText('Pendiente', { exact: true })).toBeVisible();
			await expect(adminPage.getByText(guestName, { exact: true })).toBeVisible();
			await expect(adminPage.getByText('Sin respuesta', { exact: true })).toBeVisible();
			const summary = adminPage.getByRole('group', { name: 'Resumen de asistencia' });
			await expect(summary).toContainText('2 lugares en total');
			await expect(summary).toContainText('0 asistirán');
			await expect(summary).toContainText('1 lugar libre');
		});

		await test.step('confirmar después al invitado restaurado', async () => {
			const restoredRow = publicPage.getByRole('listitem').filter({ hasText: guestName });
			await restoredRow.getByRole('button', { name: 'Sí' }).click();
			await publicPage.getByRole('button', { name: 'Confirmar asistencia' }).click();
			await expect(publicPage.getByRole('status').filter({ hasText: 'Tu respuesta se guardó correctamente.' })).toBeVisible();
			const stored = await apiInvitation(adminPage, invitationId);
			expect(stored.invitation.guests[0].attending).toBe(true);
			expect(stored.invitation.rsvpStatus).toBe('confirmed');
			await adminPage.reload();
			await expect(adminPage.getByText('Confirmada', { exact: true })).toBeVisible();
			await expect(adminPage.getByText('Asiste', { exact: true })).toBeVisible();
		});

		await test.step('rechazar explícitamente una invitación solo de lugares abiertos', async () => {
			const declined = await createInvitation(adminPage, {
				displayName: declineName,
				guestName: '',
				openSlots: 1,
				replacementsAllowed: false,
			});
			const declinePage = await context.newPage();
			await declinePage.setViewportSize({ width: 390, height: 844 });
			await declinePage.goto(`${PUBLIC_URL}/invitacion/${encodeURIComponent(declined.id)}`);
			await declinePage.getByRole('button', { name: 'Comenzar' }).click();
			await expect(declinePage.getByRole('button', { name: 'Nadie asistirá' })).toBeVisible();
			await declinePage.getByRole('button', { name: 'Nadie asistirá' }).click();
			await expect(declinePage.getByRole('status').filter({ hasText: 'Se registró que nadie asistirá.' })).toBeVisible();
			const stored = await apiInvitation(adminPage, declined.id);
			expect(stored.invitation.rsvpStatus).toBe('declined');
			expect(stored.invitation.guests).toHaveLength(1);
			expect(stored.invitation.guests[0]).toMatchObject({ type: 'open', name: '' });
			expect(stored.invitation.guests[0].attending).not.toBe(true);
			await adminPage.goto(`${ADMIN_URL}/invitaciones/${encodeURIComponent(declined.id)}`);
			await expect(adminPage.getByText('Declinada', { exact: true })).toBeVisible();
			const summary = adminPage.getByRole('group', { name: 'Resumen de asistencia' });
			await expect(summary).toContainText('1 lugar en total');
			await expect(summary).toContainText('0 asistirán');
			await expect(summary).toContainText('1 lugar libre');
			const unassigned = adminPage.getByRole('listitem').filter({ hasText: 'Lugar sin asignar' });
			await expect(unassigned).toBeVisible();
			await expect(unassigned).not.toContainText('No asiste');
			await declinePage.close();
		});

		console.log(`Browser requests blocked outside loopback: ${[...blockedExternalOrigins].join(', ') || 'none'}`);
	} finally {
		await context.close();
	}
});
