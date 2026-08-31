import type { Invitation } from './InvitationContext';

const RSVP_CLOSE_DATE = new Date('2028-03-12T05:00:00.000Z');

export function getRsvpAvailability(
	invitation: Invitation | null,
	now: Date,
) {
	const isGeneralRsvpClosed =
		now.getTime() >= RSVP_CLOSE_DATE.getTime();

	const hasActiveOverride =
		invitation?.editOverrideUntil instanceof Date &&
		now.getTime() < invitation.editOverrideUntil.getTime();

	const canEditRsvp =
		invitation?.isArchived !== true &&
		(!isGeneralRsvpClosed || hasActiveOverride);

	return {
		canEditRsvp,
		isRsvpClosed: !canEditRsvp,
	};
}
