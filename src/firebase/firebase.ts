import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (
	import.meta.env.VITE_USE_FIREBASE_EMULATORS &&
	import.meta.env.VITE_USE_FIREBASE_EMULATORS !== 'true' &&
	import.meta.env.VITE_USE_FIREBASE_EMULATORS !== 'false'
) {
	throw new Error('VITE_USE_FIREBASE_EMULATORS debe ser true o false.');
}

if (useFirebaseEmulators && !import.meta.env.DEV) {
	throw new Error('Firebase Emulator Suite solo se puede habilitar en desarrollo.');
}

const productionFirebaseConfig = {
	apiKey: 'AIzaSyDcon-gpJXiWDnwJPfIwuia9Qy2mMep2To',
	authDomain: 'boda-america-y-carlos.firebaseapp.com',
	projectId: 'boda-america-y-carlos',
	storageBucket: 'boda-america-y-carlos.firebasestorage.app',
	messagingSenderId: '1077064926354',
	appId: '1:1077064926354:web:15fdf0bd1ce9b8148a924b',
};

const firebaseConfig = useFirebaseEmulators
	? {
		apiKey: 'demo-api-key',
		authDomain: 'demo-boda.firebaseapp.com',
		projectId: 'demo-boda',
		storageBucket: 'demo-boda.appspot.com',
		messagingSenderId: '0',
		appId: '1:0:web:demo',
	}
	: productionFirebaseConfig;

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

if (useFirebaseEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080);
