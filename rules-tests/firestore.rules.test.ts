import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
	assertFails,
	assertSucceeds,
	initializeTestEnvironment,
	type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

let environment: RulesTestEnvironment;

beforeAll(async () => {
	environment = await initializeTestEnvironment({
		projectId: 'demo-boda',
		firestore: { rules: await readFile(resolve('firestore.rules'), 'utf8') },
	});
});

beforeEach(async () => {
	await environment.clearFirestore();
	await environment.withSecurityRulesDisabled(async (context) => {
		await setDoc(doc(context.firestore(), 'invitations', 'ACTIVE123'), {
			displayName: 'Familia Pérez', maxGuests: 1, replacementsAllowed: true,
			rsvpStatus: 'pending', message: '', isArchived: false, archivedAt: null,
			updatedAt: null, editOverrideUntil: null,
			guests: [{ name: 'Carlos', shortName: 'Carlos', type: 'known', attending: null }],
			searchPrefixes: ['c', 'ca', 'car'],
		});
		await setDoc(doc(context.firestore(), 'invitations', 'ARCHIVED'), {
			displayName: 'Archivada', maxGuests: 1, replacementsAllowed: false,
			rsvpStatus: 'declined', message: '', isArchived: true, archivedAt: null,
			updatedAt: null, editOverrideUntil: null,
			guests: [{ name: 'Ana', shortName: 'Ana', type: 'known', attending: false }],
			searchPrefixes: ['a', 'an', 'ana'],
		});
	});
});

afterAll(async () => environment.cleanup());

describe('Firestore invitation rules after RSVP API migration', () => {
	it('allows a direct read of an active invitation but not an archived one', async () => {
		const db = environment.unauthenticatedContext().firestore();
		await assertSucceeds(getDoc(doc(db, 'invitations', 'ACTIVE123')));
		await assertFails(getDoc(doc(db, 'invitations', 'ARCHIVED')));
	});

	it('continues to deny collection enumeration', async () => {
		const db = environment.unauthenticatedContext().firestore();
		await assertFails(getDocs(collection(db, 'invitations')));
	});

	it('denies direct RSVP, search index and administrative writes', async () => {
		const db = environment.unauthenticatedContext().firestore();
		const invitation = doc(db, 'invitations', 'ACTIVE123');
		await assertFails(updateDoc(invitation, { message: 'Hola', rsvpStatus: 'confirmed' }));
		await assertFails(updateDoc(invitation, { searchPrefixes: ['forged'] }));
		await assertFails(updateDoc(invitation, { displayName: 'Alterada', maxGuests: 99 }));
		await assertFails(setDoc(doc(db, 'invitations', 'CREATED'), { displayName: 'Creada' }));
		await assertFails(deleteDoc(invitation));
	});

	it('does not turn a signed-in browser into an administrative writer', async () => {
		const db = environment.authenticatedContext('admin-user').firestore();
		await assertFails(updateDoc(doc(db, 'invitations', 'ACTIVE123'), { displayName: 'Alterada' }));
	});

	it('keeps trusted server-style access available outside client Rules', async () => {
		await environment.withSecurityRulesDisabled(async (context) => {
			const invitation = doc(context.firestore(), 'invitations', 'ACTIVE123');
			await assertSucceeds(updateDoc(invitation, { displayName: 'Cambio de Boda-API' }));
		});
	});
});
