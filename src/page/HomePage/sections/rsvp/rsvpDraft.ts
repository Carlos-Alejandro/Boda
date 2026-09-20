import type { Invitation } from '../../../../firebase/InvitationContext';
import type { RsvpDraft } from '../../../../firebase/savePublicRsvp';

export function createRsvpDraft(invitation: Invitation): RsvpDraft {
	return {
		responses: invitation.guests.map(guest => guest.type === 'replacement' ? false
			: guest.type === 'open' ? (guest.name.trim() ? true : null) : guest.attending),
		replacementNames: invitation.guests.map(guest => guest.type === 'replacement' ? guest.name : ''),
		openGuestNames: invitation.guests.map(guest => guest.type === 'open' ? guest.name : ''),
		message: invitation.message,
	};
}

// UI validation only. Persisted transformations remain in rsvpLogic.
export const isValidGuestName = (name: string) => name.trim().length >= 2;
export type GuestError = 'response' | 'name' | null;

export function inspectRsvpDraft(invitation: Invitation, draft: RsvpDraft) {
	let attending = 0;
	let unanswered = 0;
	const errors: GuestError[] = invitation.guests.map((guest, index) => {
		if (guest.type === 'open') {
			const name = draft.openGuestNames[index] ?? '';
			if (isValidGuestName(name)) attending++;
			return name.trim() && !isValidGuestName(name) ? 'name' : null;
		}
		const response = draft.responses[index] ?? null;
		const name = draft.replacementNames[index] ?? '';
		if (response === true || (response === false && invitation.replacementsAllowed && isValidGuestName(name))) attending++;
		if (response === null) {
			unanswered++;
			return 'response';
		}
		return response === false && name.trim() && !isValidGuestName(name) ? 'name' : null;
	});
	return { attending, unanswered, errors };
}
