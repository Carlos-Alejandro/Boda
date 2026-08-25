import { Timestamp } from 'firebase/firestore';

import type {
	Guest,
	Invitation,
} from './InvitationContext';

const validGuestTypes = new Set([
	'known',
	'open',
	'replacement',
]);

const validRsvpStatuses = new Set([
	'pending',
	'confirmed',
	'partial',
	'declined',
]);

function isPlainObject(
	value: unknown,
): value is Record<string, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value)
	);
}

function isValidGuest(
	value: unknown,
): value is Guest {
	if (!isPlainObject(value)) {
		return false;
	}

	const {
		name,
		shortName,
		type,
		attending,
		originalName,
	} = value;

	if (typeof name !== 'string') {
		return false;
	}

	if (typeof shortName !== 'string') {
		return false;
	}

	if (
		typeof type !== 'string' ||
		!validGuestTypes.has(type)
	) {
		return false;
	}

	if (
		attending !== true &&
		attending !== false &&
		attending !== null
	) {
		return false;
	}

	if (
		originalName !== undefined &&
		typeof originalName !== 'string'
	) {
		return false;
	}

	if (
		type === 'replacement' &&
		typeof originalName !== 'string'
	) {
		return false;
	}

	return true;
}

export function parseInvitation(
	id: string,
	data: unknown,
): Invitation | null {
	if (!isPlainObject(data)) {
		return null;
	}

	const {
		displayName,
		maxGuests,
		replacementsAllowed,
		rsvpStatus,
		message,
		updatedAt,
		editOverrideUntil,
		guests,
	} = data;

	if (typeof displayName !== 'string') {
		return null;
	}

	if (
		typeof maxGuests !== 'number' ||
		!Number.isInteger(maxGuests) ||
		maxGuests < 1
	) {
		return null;
	}

	if (typeof replacementsAllowed !== 'boolean') {
		return null;
	}

	if (
		typeof rsvpStatus !== 'string' ||
		!validRsvpStatuses.has(rsvpStatus)
	) {
		return null;
	}

	if (typeof message !== 'string') {
		return null;
	}

	if (
		!Array.isArray(guests) ||
		!guests.every(isValidGuest)
	) {
		return null;
	}

	if (guests.length !== maxGuests) {
		return null;
	}

	let parsedEditOverrideUntil: Date | null = null;

	if (editOverrideUntil instanceof Timestamp) {
		parsedEditOverrideUntil =
			editOverrideUntil.toDate();
	} else if (editOverrideUntil !== null) {
		return null;
	}

	return {
		id,
		displayName,
		maxGuests,
		replacementsAllowed,
		rsvpStatus,
		message,
		updatedAt: updatedAt ?? null,
		editOverrideUntil: parsedEditOverrideUntil,
		guests,
	};
}