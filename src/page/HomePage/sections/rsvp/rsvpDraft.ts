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

export function restoreReplacementDraft(draft: RsvpDraft, index: number): RsvpDraft {
	return {
		...draft,
		responses: draft.responses.map((response, i) => i === index ? null : response),
		replacementNames: draft.replacementNames.map((name, i) => i === index ? '' : name),
	};
}

export type SuccessfulRsvpStatus = 'success' | 'declined' | 'restored';

export function getSuccessfulRsvpStatus(invitation: Invitation, draft: RsvpDraft, declineAll = false): SuccessfulRsvpStatus {
	if (declineAll) return 'declined';
	const restoredReplacement = invitation.guests.some((guest, index) =>
		guest.type === 'replacement' && draft.responses[index] === null && !(draft.replacementNames[index] ?? '').trim(),
	);
	return restoredReplacement ? 'restored' : 'success';
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
			if (guest.type === 'replacement' && !name.trim()) return null;
			unanswered++;
			return 'response';
		}
		return response === false && name.trim() && !isValidGuestName(name) ? 'name' : null;
	});
	return { attending, unanswered, errors };
}

export function hasAmbiguousEmptyRsvp(invitation: Invitation, draft: RsvpDraft) {
	const inspection = inspectRsvpDraft(invitation, draft);
	if (inspection.attending > 0) return false;

	return !invitation.guests.some((guest, index) =>
		(guest.type !== 'open' && draft.responses[index] === false) ||
		(guest.type === 'replacement' && draft.responses[index] === null && !(draft.replacementNames[index] ?? '').trim()),
	);
}
