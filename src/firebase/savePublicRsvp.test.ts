import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Invitation } from './InvitationContext';
import { RsvpConflictError, RsvpUnavailableError, savePublicRsvp, type RsvpDraft } from './savePublicRsvp';

vi.hoisted(() => vi.stubEnv('VITE_API_BASE_URL', 'https://api.test'));

const base = (): Invitation => ({
	id: 'ABC12345',
	displayName: 'Familia Pérez',
	maxGuests: 2,
	replacementsAllowed: true,
	rsvpStatus: 'pending',
	message: '',
	isArchived: false,
	archivedAt: null,
	updatedAt: null,
	editOverrideUntil: null,
	guests: [
		{ name: 'Carlos Martínez', shortName: 'Carlos', type: 'known', attending: null },
		{ name: '', shortName: 'Acompañante', type: 'open', attending: null },
	],
});

const draft = (): RsvpDraft => ({
	responses: [false, null],
	replacementNames: ['Mariana López', ''],
	openGuestNames: ['', 'Ana Pérez'],
	message: ' Gracias ',
});

function responseInvitation() {
	return {
		...base(),
		rsvpStatus: 'confirmed',
		message: 'Gracias',
		updatedAt: '2027-01-01T00:00:00.000Z',
		guests: [
			{ name: 'Mariana López', shortName: 'Mariana', type: 'replacement', attending: true, originalName: 'Carlos Martínez' },
			{ name: 'Ana Pérez', shortName: 'Ana', type: 'open', attending: true },
		],
	};
}

describe('savePublicRsvp through Boda-API', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(responseInvitation()), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})));
	});

	afterEach(() => vi.unstubAllGlobals());

	it('sends only expected state and RSVP draft to the public endpoint', async () => {
		const current = base();
		const submitted = draft();
		const saved = await savePublicRsvp(current, submitted);
		expect(saved).toMatchObject({ rsvpStatus: 'confirmed', message: 'Gracias' });
		const [url, options] = vi.mocked(fetch).mock.calls[0];
		expect(url).toBe('https://api.test/api/public/invitations/ABC12345/rsvp');
		expect(options?.method).toBe('POST');
		const body = JSON.parse(options?.body as string);
		expect(Object.keys(body).sort()).toEqual(['expectedState', 'message', 'openGuestNames', 'replacementNames', 'responses']);
		expect(body).toMatchObject({
			responses: [false, null],
			replacementNames: ['Mariana López', ''],
			openGuestNames: ['', 'Ana Pérez'],
			message: ' Gracias ',
		});
		expect(body.expectedState).toContain('Carlos Martínez');
		expect(current.guests[0].attending).toBeNull();
		expect(submitted.replacementNames[0]).toBe('Mariana López');
	});

	it.each([
		['RSVP_CONFLICT', RsvpConflictError],
		['RSVP_UNAVAILABLE', RsvpUnavailableError],
	] as const)('maps %s without discarding the caller draft', async (code, ErrorType) => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code, message: 'safe' } }), { status: 409 }));
		const submitted = draft();
		await expect(savePublicRsvp(base(), submitted)).rejects.toBeInstanceOf(ErrorType);
		expect(submitted).toEqual(draft());
	});

	it('keeps transport and server failures as retryable generic errors', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR' } }), { status: 500 }));
		await expect(savePublicRsvp(base(), draft())).rejects.toThrow(/status 500/);
		vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
		await expect(savePublicRsvp(base(), draft())).rejects.toThrow('offline');
	});

	it('rejects a malformed success response', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		await expect(savePublicRsvp(base(), draft())).rejects.toThrow('Invalid RSVP response');
	});
});
