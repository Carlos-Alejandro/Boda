import { describe, expect, it } from 'vitest';

import type { Invitation } from './InvitationContext';
import { getRsvpAvailability } from './rsvpAvailability';

function invitation(overrides: Partial<Invitation> = {}): Invitation {
	return {
		id: 'invitation-id',
		displayName: 'Familia Perez',
		maxGuests: 1,
		replacementsAllowed: true,
		rsvpStatus: 'pending',
		message: '',
		isArchived: false,
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
		...overrides,
	};
}

describe('getRsvpAvailability', () => {
	it('allows an active invitation before the deadline', () => {
		expect(
			getRsvpAvailability(
				invitation(),
				new Date('2027-01-01T00:00:00.000Z'),
			).canEditRsvp,
		).toBe(true);
	});

	it('blocks an archived invitation', () => {
		expect(
			getRsvpAvailability(
				invitation({ isArchived: true }),
				new Date('2027-01-01T00:00:00.000Z'),
			).canEditRsvp,
		).toBe(false);
	});

	it('keeps archived invitations blocked despite a future override', () => {
		expect(
			getRsvpAvailability(
				invitation({
					isArchived: true,
					editOverrideUntil: new Date('2030-01-01T00:00:00.000Z'),
				}),
				new Date('2029-01-01T00:00:00.000Z'),
			).canEditRsvp,
		).toBe(false);
	});
});
