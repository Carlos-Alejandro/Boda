import { describe, expect, it } from 'vitest';
import type { Guest, Invitation } from '../../../../firebase/InvitationContext';
import { buildUpdatedGuests, calculateRsvpStatus } from '../rsvpLogic';
import { createRsvpDraft, inspectRsvpDraft } from './rsvpDraft';

const known: Guest = { name: 'Carlos Pérez', shortName: 'Carlos', type: 'known', attending: null };
const open: Guest = { name: '', shortName: 'Acompañante', type: 'open', attending: null };
const replacement: Guest = { name: 'Mariana López', shortName: 'Mariana', originalName: known.name, type: 'replacement', attending: true };
function fixture(guests: Guest[], replacementsAllowed = true): Invitation {
	return { id: 'local-test', displayName: 'Familia Pérez', maxGuests: guests.length, replacementsAllowed,
		rsvpStatus: 'pending', message: '', isArchived: false, archivedAt: null, updatedAt: null, editOverrideUntil: null, guests };
}

describe('RSVP draft validation and attendance preview', () => {
	it.each([1, 2, 4, 6, 12, 30])('preserves all %i slots and flags unanswered known guests', count => {
		const invitation = fixture(Array.from({ length: count }, (_, index) => ({ ...known, name: `Persona ${index}` })));
		const draft = createRsvpDraft(invitation);
		expect(draft.responses).toHaveLength(count);
		expect(inspectRsvpDraft(invitation, draft)).toEqual({ attending: 0, unanswered: count, errors: Array(count).fill('response') });
		draft.responses = draft.responses.map((_, index) => index % 2 === 0);
		expect(inspectRsvpDraft(invitation, draft)).toEqual({ attending: Math.ceil(count / 2), unanswered: 0, errors: Array(count).fill(null) });
	});
	it.each(['A', ' A ', ' ', ''])('does not count invalid or empty open name %j', name => {
		const invitation = fixture([open]);
		const draft = createRsvpDraft(invitation);
		draft.openGuestNames[0] = name;
		const result = inspectRsvpDraft(invitation, draft);
		expect(result.attending).toBe(0);
		expect(result.errors).toEqual([name.trim() ? 'name' : null]);
	});
	it('allows an open guest independently of known absence and replacement permission', () => {
		const invitation = fixture([known, open], false);
		const draft = createRsvpDraft(invitation);
		draft.responses[0] = false;
		draft.openGuestNames[1] = ' Ana López ';
		expect(inspectRsvpDraft(invitation, draft)).toEqual({ attending: 1, unanswered: 0, errors: [null, null] });
		const guests = buildUpdatedGuests(invitation.guests, false, draft.responses, draft.replacementNames, draft.openGuestNames);
		expect(guests[1]).toMatchObject({ name: 'Ana López', type: 'open', attending: true });
		expect(calculateRsvpStatus(guests)).toBe('partial');
		draft.openGuestNames[1] = '';
		expect(inspectRsvpDraft(invitation, draft).attending).toBe(0);
	});
	it('counts only a valid permitted replacement and preserves original slot', () => {
		const invitation = fixture([known]);
		const draft = createRsvpDraft(invitation);
		draft.responses[0] = false;
		draft.replacementNames[0] = 'M';
		expect(inspectRsvpDraft(invitation, draft)).toMatchObject({ attending: 0, errors: ['name'] });
		draft.replacementNames[0] = 'Mariana López';
		expect(inspectRsvpDraft(invitation, draft).attending).toBe(1);
		expect(inspectRsvpDraft({ ...invitation, replacementsAllowed: false }, draft).attending).toBe(0);
		expect(buildUpdatedGuests(invitation.guests, true, draft.responses, draft.replacementNames, draft.openGuestNames)).toEqual([replacement]);
	});
	it('initializes saved replacements for editing, removal and restoration', () => {
		const invitation = fixture([replacement]);
		const draft = createRsvpDraft(invitation);
		expect(draft.responses).toEqual([false]);
		expect(draft.replacementNames).toEqual(['Mariana López']);
		draft.replacementNames[0] = 'Laura Gómez';
		const edited = buildUpdatedGuests(invitation.guests, true, draft.responses, draft.replacementNames, draft.openGuestNames);
		expect(edited[0]).toMatchObject({ name: 'Laura Gómez', originalName: known.name });
		draft.replacementNames[0] = '';
		expect(buildUpdatedGuests(invitation.guests, true, draft.responses, draft.replacementNames, draft.openGuestNames)).toEqual([{ ...known, attending: false }]);
		draft.responses[0] = true;
		expect(buildUpdatedGuests(invitation.guests, true, draft.responses, draft.replacementNames, draft.openGuestNames)).toEqual([{ ...known, attending: true }]);
	});
	it('reinitializes from committed data without mutating the invitation', () => {
		const invitation = fixture([known, open]);
		const before = structuredClone(invitation);
		const draft = createRsvpDraft(invitation);
		draft.responses[0] = true;
		draft.openGuestNames[1] = 'Ana';
		draft.message = 'Nos vemos';
		expect(invitation).toEqual(before);
		const guests = buildUpdatedGuests(invitation.guests, true, draft.responses, draft.replacementNames, draft.openGuestNames);
		expect(createRsvpDraft({ ...invitation, guests, message: draft.message })).toEqual({ ...draft, responses: [true, true] });
	});
});
