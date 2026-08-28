import { describe, expect, it } from 'vitest';

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
