import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseMocks = vi.hoisted(() => ({
	initializeApp: vi.fn((config: unknown) => ({ config })),
	getFirestore: vi.fn((app: unknown) => ({ app })),
	connectFirestoreEmulator: vi.fn(),
}));

vi.mock('firebase/app', () => ({ initializeApp: firebaseMocks.initializeApp }));
vi.mock('firebase/firestore', () => ({
	getFirestore: firebaseMocks.getFirestore,
	connectFirestoreEmulator: firebaseMocks.connectFirestoreEmulator,
}));

describe('Firebase emulator configuration', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.unstubAllEnvs();
		vi.clearAllMocks();
	});

	it('uses only demo-boda and the local Firestore emulator when explicitly enabled', async () => {
		vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');

		await import('./firebase');

		expect(firebaseMocks.initializeApp).toHaveBeenCalledWith(
			expect.objectContaining({ projectId: 'demo-boda' }),
		);
		expect(firebaseMocks.connectFirestoreEmulator).toHaveBeenCalledWith(
			expect.anything(),
			'127.0.0.1',
			8080,
		);
	});

	it('does not connect an emulator when the explicit option is false', async () => {
		vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'false');

		await import('./firebase');

		expect(firebaseMocks.connectFirestoreEmulator).not.toHaveBeenCalled();
	});
});
