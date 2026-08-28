import type { Guest } from '../../../firebase/InvitationContext';

export type AttendanceResponse = boolean | null;

export type CalculatedRsvpStatus =
	| 'confirmed'
	| 'partial'
	| 'declined';

export function getOriginalName(guest: Guest) {
	if (guest.type === 'replacement' && guest.originalName) {
		return guest.originalName;
	}

	return guest.name;
}

export function getOriginalShortName(guest: Guest) {
	const originalName = getOriginalName(guest);

	return (
		originalName.trim().split(/\s+/)[0] ||
		guest.shortName
	);
}

export function buildUpdatedGuests(
	guests: Guest[],
	replacementsAllowed: boolean,
	responses: AttendanceResponse[],
	replacementNames: string[],
	openGuestNames: string[],
) {
	return guests.map((guest, index) => {
		if (guest.type === 'open') {
			const openGuestName =
				openGuestNames[index]?.trim() ?? '';

			if (!openGuestName) {
				return {
					name: '',
					shortName: 'Acompañante',
					type: 'open' as const,
					attending: false,
				};
			}

			return {
				name: openGuestName,
				shortName:
					openGuestName.split(/\s+/)[0] ||
					'Acompañante',
				type: 'open' as const,
				attending: true,
			};
		}

		const response = responses[index];

		const replacementName =
			replacementNames[index]?.trim() ?? '';

		const originalName = getOriginalName(guest);
		const originalShortName =
			getOriginalShortName(guest);

		if (response === true) {
			return {
				name: originalName,
				shortName: originalShortName,
				type: 'known' as const,
				attending: true,
			};
		}

		if (
			response === false &&
			replacementsAllowed &&
			replacementName
		) {
			return {
				name: replacementName,
				shortName:
					replacementName.split(/\s+/)[0] ||
					replacementName,
				type: 'replacement' as const,
				attending: true,
				originalName,
			};
		}

		return {
			name: originalName,
			shortName: originalShortName,
			type: 'known' as const,
			attending: false,
		};
	});
}

export function calculateRsvpStatus(
	guests: Guest[],
): CalculatedRsvpStatus {
	const attendingCount = guests.filter(
		(guest) => guest.attending === true,
	).length;

	const declinedKnownCount = guests.filter(
		(guest) =>
			guest.type === 'known' &&
			guest.attending === false,
	).length;

	if (attendingCount === 0) {
		return 'declined';
	}

	if (declinedKnownCount > 0) {
		return 'partial';
	}

	return 'confirmed';
}
