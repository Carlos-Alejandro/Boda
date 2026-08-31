import { describe, expect, it } from 'vitest';

import {
	INVITATION_UNAVAILABLE_MESSAGE,
	loadPublicInvitation,
} from './loadPublicInvitation';

describe('loadPublicInvitation', () => {
	it('maps permission-denied to the generic unavailable message', async () => {
		await expect(
			loadPublicInvitation(async () => {
				throw new Error('permission-denied');
			}),
		).rejects.toThrow(INVITATION_UNAVAILABLE_MESSAGE);
	});

	it('maps a missing document to the same generic message', async () => {
		await expect(
			loadPublicInvitation(async () => ({
				id: 'missing',
				exists: () => false,
				data: () => undefined,
			})),
		).rejects.toThrow(INVITATION_UNAVAILABLE_MESSAGE);
	});

	it('does not reveal archive state in the public error', async () => {
		await expect(
			loadPublicInvitation(async () => ({
				id: 'archived',
				exists: () => true,
				data: () => ({
					displayName: 'Familia',
					maxGuests: 1,
					replacementsAllowed: true,
					rsvpStatus: 'pending',
					message: '',
					isArchived: true,
					archivedAt: null,
					updatedAt: null,
					editOverrideUntil: null,
					guests: [
						{
							name: 'Carlos',
							shortName: 'Carlos',
							type: 'known',
							attending: null,
						},
					],
				}),
			})),
		).rejects.toThrow(INVITATION_UNAVAILABLE_MESSAGE);
	});
});
