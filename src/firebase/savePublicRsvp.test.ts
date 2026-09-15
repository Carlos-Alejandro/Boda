import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import type { Guest } from './InvitationContext';
import { parseInvitation } from './validateInvitation';
import { RsvpConflictError, RsvpUnavailableError, savePublicRsvp } from './savePublicRsvp';

const mocks = vi.hoisted(() => ({
	run: vi.fn(), get: vi.fn(), update: vi.fn(),
}));
vi.mock('./firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', async (original) => ({
	...await original<typeof import('firebase/firestore')>(),
	doc: vi.fn(() => ({ id: 'test' })),
	runTransaction: mocks.run,
	serverTimestamp: vi.fn(() => 'server-time'),
}));
const known = (name = 'Carlos Martinez'): Guest => ({ name, shortName: 'Carlos', type: 'known', attending: null });
const replacement: Guest = { name: 'Mariana', shortName: 'Mariana', type: 'replacement', attending: true, originalName: 'Cassandra' };
function data(guests: Guest[] = [known()]) {
	return { displayName: 'Familia', maxGuests: guests.length, replacementsAllowed: true,
		rsvpStatus: 'pending', message: 'A', isArchived: false, archivedAt: null as Timestamp | null,
		updatedAt: null as unknown, editOverrideUntil: null as Timestamp | null, guests };
}
type Document = ReturnType<typeof data>;
const baseOf = (document: Document) => parseInvitation('test', document)!;
const draft = () => ({ responses: [true], replacementNames: [''], openGuestNames: [''], message: ' C ' });
const snapshot = (document: Document) => ({ id: 'test', exists: () => true, data: () => document });
let remote: Document;
let committed: number;
beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2027-01-01'));
	vi.clearAllMocks();
	remote = data();
	committed = 0;
	mocks.get.mockImplementation(async () => snapshot(remote));
	mocks.run.mockImplementation(async (_db, callback) => {
		mocks.update.mockClear();
		const result = await callback({ get: mocks.get, update: mocks.update });
		if (mocks.update.mock.calls.length) {
			remote = { ...remote, ...mocks.update.mock.calls[0][1] };
			committed++;
		}
		return result;
	});
});
afterEach(() => vi.useRealTimers());

describe('savePublicRsvp', () => {
	it('saves only RSVP fields and permits a second save with the returned committed base', async () => {
		const base = baseOf(remote);
		const saved = await savePublicRsvp(base, draft());
		expect(remote).toMatchObject({ message: 'C', rsvpStatus: 'confirmed', updatedAt: 'server-time' });
		expect(Object.keys(mocks.update.mock.calls[0][1]).sort()).toEqual(['guests','message','rsvpStatus','updatedAt']);
		expect(base.guests[0].attending).toBeNull();
		const second = await savePublicRsvp(saved, { ...draft(), responses: [false], message: 'D' });
		expect(second.rsvpStatus).toBe('declined');
		expect(remote.message).toBe('D');
		expect(committed).toBe(2);
	});
	it.each([
		['name', { name: 'Carlos Martínez' }],
		['shortName', { shortName: 'Carlitos' }],
		['type', { type: 'open' }],
		['attending', { attending: false }],
		['originalName', { originalName: 'Legacy' }],
	] as const)('rejects changed guest %s without writing', async (_field, change) => {
		const base = baseOf(remote);
		remote = { ...remote, guests: [{ ...remote.guests[0], ...change }] };
		const before = JSON.stringify(remote);
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpConflictError);
		expect(mocks.update).not.toHaveBeenCalled();
		expect(JSON.stringify(remote)).toBe(before);
	});
	it('never resurrects a replacement restored by Admin', async () => {
		const base = baseOf(data([replacement]));
		remote = data([known('Cassandra')]);
		await expect(savePublicRsvp(base, { ...draft(), responses: [false], replacementNames: ['Mariana'] }))
			.rejects.toBeInstanceOf(RsvpConflictError);
		expect(remote.guests).toEqual([known('Cassandra')]);
		expect(committed).toBe(0);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it.each(['increase', 'decrease', 'order'])('rejects changed capacity/order: %s', async (change) => {
		remote = data([known(), known('Ana')]);
		const base = baseOf(remote);
		const guests = change === 'increase' ? [...remote.guests, known('Luis')]
			: change === 'decrease' ? remote.guests.slice(0, 1) : [...remote.guests].reverse();
		remote = { ...remote, guests, maxGuests: guests.length };
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpConflictError);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it.each([
		{ replacementsAllowed: false }, { message: 'B' }, { rsvpStatus: 'confirmed' },
		{ archivedAt: Timestamp.fromDate(new Date('2026-01-01')) },
		{ editOverrideUntil: Timestamp.fromDate(new Date('2030-01-01')) },
	])('protects changed form metadata %j', async (change) => {
		const base = baseOf(remote);
		remote = { ...remote, ...change };
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpConflictError);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('allows unrelated displayName and updatedAt changes', async () => {
		const base = baseOf(remote);
		remote = { ...remote, displayName: 'Familia nueva', updatedAt: Timestamp.now() };
		await savePublicRsvp(base, draft());
		expect(remote.displayName).toBe('Familia nueva');
		expect(committed).toBe(1);
	});
	it('blocks archived invitations even with override', async () => {
		const base = baseOf(remote);
		remote = { ...remote, isArchived: true, editOverrideUntil: Timestamp.fromDate(new Date('2030-01-01')) };
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpUnavailableError);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('checks deadline at save time', async () => {
		const base = baseOf(remote);
		vi.setSystemTime(new Date('2029-01-01'));
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpUnavailableError);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('allows a current override, but blocks a revoked override', async () => {
		vi.setSystemTime(new Date('2029-01-01'));
		remote.editOverrideUntil = Timestamp.fromDate(new Date('2030-01-01'));
		const saved = await savePublicRsvp(baseOf(remote), draft());
		remote = { ...remote, editOverrideUntil: null };
		mocks.update.mockClear();
		await expect(savePublicRsvp(saved, draft())).rejects.toBeInstanceOf(RsvpUnavailableError);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('keeps the original base when the SDK retries after contention', async () => {
		const base = baseOf(remote);
		mocks.run.mockImplementation(async (_db, callback) => {
			await callback({ get: mocks.get, update: mocks.update });
			// First attempt was aborted, not committed.
			mocks.update.mockClear();
			remote = { ...remote, guests: [known('Carlos Martínez')] };
			return callback({ get: mocks.get, update: mocks.update });
		});
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpConflictError);
		expect(mocks.get).toHaveBeenCalledTimes(2);
		expect(mocks.update).not.toHaveBeenCalled();
		expect(committed).toBe(0);
	});
	it('keeps actual Firestore errors distinct from conflicts', async () => {
		const error = Object.assign(new Error('offline'), { code: 'unavailable' });
		mocks.get.mockRejectedValue(error);
		await expect(savePublicRsvp(baseOf(remote), draft())).rejects.toBe(error);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('reports rules denial as unavailable without claiming it proves archive', async () => {
		mocks.get.mockRejectedValue({ code: 'permission-denied' });
		await expect(savePublicRsvp(baseOf(remote), draft())).rejects.toBeInstanceOf(RsvpUnavailableError);
	});
	it('blocks missing and invalid documents without writes', async () => {
		const base = baseOf(remote);
		mocks.get.mockResolvedValueOnce({ exists: () => false });
		await expect(savePublicRsvp(base, draft())).rejects.toBeInstanceOf(RsvpUnavailableError);
		mocks.get.mockResolvedValueOnce({ id: 'test', exists: () => true, data: () => ({}) });
		await expect(savePublicRsvp(base, draft())).rejects.toThrow('Invalid invitation');
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it('preserves existing open/replacement/shortName and RSVP construction', async () => {
		remote = data([known(), { name: '', shortName: 'Acompañante', type: 'open', attending: null }]);
		const saved = await savePublicRsvp(baseOf(remote), {
			responses: [false, null], replacementNames: [' Mariana Prueba ', ''],
			openGuestNames: ['', ' Ana López '], message: '',
		});
		expect(saved.guests).toEqual([
			{ name: 'Mariana Prueba', shortName: 'Mariana', type: 'replacement', attending: true, originalName: 'Carlos Martinez' },
			{ name: 'Ana López', shortName: 'Ana', type: 'open', attending: true },
		]);
		const second = await savePublicRsvp(saved, {
			responses: [true, null], replacementNames: ['', ''], openGuestNames: ['', ''], message: '',
		});
		expect(second.guests).toEqual([
			{ name: 'Carlos Martinez', shortName: 'Carlos', type: 'known', attending: true },
			{ name: '', shortName: 'Acompañante', type: 'open', attending: false },
		]);
		expect(second.rsvpStatus).toBe('confirmed');
	});
});

it('does not return a new base when commit fails', async () => {
 const base = baseOf(remote);
 const failure = new Error('commit failed');
 mocks.run.mockImplementation(async (_db, callback) => {
  await callback({ get: mocks.get, update: mocks.update });
  throw failure;
 });
 await expect(savePublicRsvp(base, draft())).rejects.toBe(failure);
 expect(base.guests[0].attending).toBeNull();
 expect(remote.guests[0].attending).toBeNull();
 expect(committed).toBe(0);
});

it('detects a remote edit after our successful commit on the next save', async () => {
 const saved = await savePublicRsvp(baseOf(remote), draft());
 remote = { ...remote, message: 'remote after commit' };
 await expect(savePublicRsvp(saved, draft())).rejects.toBeInstanceOf(RsvpConflictError);
 expect(remote.message).toBe('remote after commit');
 expect(committed).toBe(1);
});
