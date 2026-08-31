import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import { parseInvitation } from './validateInvitation';

function validData() {
	return {
		displayName: 'Familia Perez',
		maxGuests: 1,
		replacementsAllowed: true,
		rsvpStatus: 'pending',
		message: '',
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
	};
}

describe('parseInvitation archive metadata', () => {
	it('maps legacy documents as active without archivedAt', () => {
		expect(parseInvitation('legacy', validData())).toMatchObject({
			isArchived: false,
			archivedAt: null,
		});
	});

	it.each([false, true])('accepts isArchived %s', (isArchived) => {
		expect(
			parseInvitation('id', {
				...validData(),
				isArchived,
				archivedAt: null,
			})?.isArchived,
		).toBe(isArchived);
	});

	it('rejects invalid isArchived', () => {
		expect(
			parseInvitation('id', { ...validData(), isArchived: 'false' }),
		).toBeNull();
	});

	it('converts an archivedAt Timestamp to Date', () => {
		const date = new Date('2026-08-29T12:00:00.000Z');
		expect(
			parseInvitation('id', {
				...validData(),
				isArchived: true,
				archivedAt: Timestamp.fromDate(date),
			})?.archivedAt,
		).toEqual(date);
	});

	it('rejects invalid archivedAt', () => {
		expect(
			parseInvitation('id', {
				...validData(),
				archivedAt: '2026-08-29',
			}),
		).toBeNull();
	});
});
