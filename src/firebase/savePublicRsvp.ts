import { Timestamp } from 'firebase/firestore';

import type { Invitation } from './InvitationContext';
import { parseInvitation } from './validateInvitation';
import type { AttendanceResponse } from '../page/HomePage/sections/rsvpLogic';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) throw new Error('Falta la variable VITE_API_BASE_URL.');

export class RsvpConflictError extends Error {}
export class RsvpUnavailableError extends Error {}

export interface RsvpDraft {
	responses: AttendanceResponse[];
	replacementNames: string[];
	openGuestNames: string[];
	message: string;
}

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

function apiDate(value: unknown): Timestamp | null | undefined {
	if (value === null) return null;
	if (typeof value !== 'string') return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : Timestamp.fromDate(date);
}

function parseApiInvitation(value: unknown): Invitation {
	if (typeof value !== 'object' || value === null || Array.isArray(value) || !('id' in value) || typeof value.id !== 'string') {
		throw new Error('Invalid RSVP response');
	}
	const data = value as Record<string, unknown>;
	const invitation = parseInvitation(value.id, {
		...data,
		archivedAt: apiDate(data.archivedAt),
		editOverrideUntil: apiDate(data.editOverrideUntil),
	});
	if (!invitation) throw new Error('Invalid RSVP response');
	return invitation;
}

async function errorCode(response: Response): Promise<string | null> {
	try {
		const payload: unknown = await response.json();
		if (typeof payload !== 'object' || payload === null || !('error' in payload)) return null;
		const error = payload.error;
		return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
			? error.code
			: null;
	} catch {
		return null;
	}
}

export async function savePublicRsvp(base: Invitation, draft: RsvpDraft): Promise<Invitation> {
	const response = await fetch(`${API_BASE_URL}/api/public/invitations/${encodeURIComponent(base.id)}/rsvp`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			expectedState: formBase(base),
			responses: [...draft.responses],
			replacementNames: [...draft.replacementNames],
			openGuestNames: [...draft.openGuestNames],
			message: draft.message,
		}),
	});

	if (!response.ok) {
		const code = await errorCode(response);
		if (code === 'RSVP_CONFLICT') throw new RsvpConflictError();
		if (code === 'RSVP_UNAVAILABLE') throw new RsvpUnavailableError();
		throw new Error(`RSVP API failed with status ${response.status}`);
	}

	return parseApiInvitation(await response.json());
}
