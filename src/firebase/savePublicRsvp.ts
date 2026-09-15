import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Invitation } from './InvitationContext';
import { parseInvitation } from './validateInvitation';
import { getRsvpAvailability } from './rsvpAvailability';
import { buildUpdatedGuests, calculateRsvpStatus, type AttendanceResponse } from '../page/HomePage/sections/rsvpLogic';

export class RsvpConflictError extends Error {}
export class RsvpUnavailableError extends Error {}

export interface RsvpDraft {
	responses: AttendanceResponse[];
	replacementNames: string[];
	openGuestNames: string[];
	message: string;
}

// Compare form inputs, not updatedAt (a server write marker).
// displayName and unknown document metadata neither drive nor get overwritten by RSVP.
function formBase(invitation: Invitation) {
	return JSON.stringify({
		id: invitation.id, maxGuests: invitation.maxGuests,
		replacementsAllowed: invitation.replacementsAllowed,
		isArchived: invitation.isArchived,
		archivedAt: invitation.archivedAt?.getTime() ?? null,
		editOverrideUntil: invitation.editOverrideUntil?.getTime() ?? null,
		rsvpStatus: invitation.rsvpStatus, message: invitation.message,
		guests: invitation.guests.map(({ name, shortName, type, attending, originalName }) =>
			[name, shortName, type, attending, originalName ?? null]),
	});
}

export async function savePublicRsvp(base: Invitation, draft: RsvpDraft): Promise<Invitation> {
	const expected = formBase(base);
	// Snapshot inputs across retries; the callback has no React side effects.
	const submitted = {
		responses: [...draft.responses], replacementNames: [...draft.replacementNames],
		openGuestNames: [...draft.openGuestNames], message: draft.message.trim(),
	};
	const reference = doc(db, 'invitations', base.id);
	try {
		return await runTransaction(db, async (transaction) => {
			const snapshot = await transaction.get(reference);
			if (!snapshot.exists()) throw new RsvpUnavailableError();
			const current = parseInvitation(snapshot.id, snapshot.data());
			if (!current) throw new Error('Invalid invitation document');
			if (!getRsvpAvailability(current, new Date()).canEditRsvp) throw new RsvpUnavailableError();
			if (formBase(current) !== expected) throw new RsvpConflictError();
			const guests = buildUpdatedGuests(current.guests, current.replacementsAllowed,
				submitted.responses, submitted.replacementNames, submitted.openGuestNames);
			const rsvpStatus = calculateRsvpStatus(guests);
			transaction.update(reference, {
				guests, message: submitted.message, rsvpStatus, updatedAt: serverTimestamp(),
			});
			// Returned only after commit, never from a potentially newer post-commit read.
			// updatedAt is excluded from comparison, so no extra read is necessary.
			return { ...current, guests, message: submitted.message, rsvpStatus };
		});
	} catch (error) {
		// Rules deny reads of archived documents too; permission-denied does not prove archive.
		if (typeof error === 'object' && error !== null && 'code' in error &&
			error.code === 'permission-denied') throw new RsvpUnavailableError();
		throw error;
	}
}
