import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase/firestore';

import type { Guest } from './InvitationContext';
import { parseInvitation } from './validateInvitation';

function createValidInvitationData(): {
	displayName: string;
	maxGuests: number;
	replacementsAllowed: boolean;
	rsvpStatus: string;
	message: string;
	updatedAt: null;
	editOverrideUntil: null;
	guests: Guest[];
} {
	return {
		displayName: 'Familia Pérez',
		maxGuests: 1,
		replacementsAllowed: true,
		rsvpStatus: 'pending',
		message: '',
		updatedAt: null,
		editOverrideUntil: null,
		guests: [
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: null,
			},
		],
	};
}

describe('parseInvitation', () => {
	it('acepta una invitación válida', () => {
		const result = parseInvitation(
			'invitacion-valida',
			createValidInvitationData(),
		);

		expect(result).not.toBeNull();
	});

	it('conserva el id recibido', () => {
		const result = parseInvitation(
			'id-personalizado',
			createValidInvitationData(),
		);

		expect(result?.id).toBe('id-personalizado');
	});

	it('normaliza editOverrideUntil ausente como null', () => {
		const data = createValidInvitationData();
		delete (data as Partial<typeof data>).editOverrideUntil;

		const result = parseInvitation('id', data);

		expect(result?.editOverrideUntil).toBeNull();
	});

	it('acepta editOverrideUntil null', () => {
		const result = parseInvitation(
			'id',
			createValidInvitationData(),
		);

		expect(result?.editOverrideUntil).toBeNull();
	});

	it('convierte un editOverrideUntil válido a Date', () => {
		const expected = new Date('2030-01-01T00:00:00.000Z');
		const data = {
			...createValidInvitationData(),
			editOverrideUntil: Timestamp.fromDate(expected),
		};

		const result = parseInvitation('id', data);

		expect(result?.editOverrideUntil).toEqual(expected);
	});

	it('rechaza un editOverrideUntil inválido', () => {
		const data = {
			...createValidInvitationData(),
			editOverrideUntil: '2030-01-01T00:00:00.000Z',
		};

		expect(parseInvitation('id', data)).toBeNull();
	});

	it('rechaza cuando guests.length no coincide con maxGuests', () => {
		const data = createValidInvitationData();
		data.maxGuests = 2;

		expect(parseInvitation('id', data)).toBeNull();
	});

	it('rechaza un replacement sin originalName', () => {
		const data = createValidInvitationData();
		data.guests = [
			{
				name: 'Laura Gómez',
				shortName: 'Laura',
				type: 'replacement',
				attending: true,
			},
		];

		expect(parseInvitation('id', data)).toBeNull();
	});

	it.each([true, false, null])(
		'acepta un known con attending %s',
		(attending) => {
			const data = createValidInvitationData();
			data.guests[0].attending = attending;

			expect(parseInvitation('id', data)).not.toBeNull();
		},
	);

	it('acepta un open válido', () => {
		const data = createValidInvitationData();
		data.guests = [
			{
				name: '',
				shortName: 'Acompañante',
				type: 'open',
				attending: false,
			},
		];

		expect(parseInvitation('id', data)).not.toBeNull();
	});

	it('acepta un replacement válido con originalName', () => {
		const data = createValidInvitationData();
		data.guests = [
			{
				name: 'Laura Gómez',
				shortName: 'Laura',
				type: 'replacement',
				attending: true,
				originalName: 'Carlos Pérez',
			},
		];

		expect(parseInvitation('id', data)).not.toBeNull();
	});
});
