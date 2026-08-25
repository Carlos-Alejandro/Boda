import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyDcon-gpJXiWDnwJPfIwuia9Qy2mMep2To',
	authDomain: 'boda-america-y-carlos.firebaseapp.com',
	projectId: 'boda-america-y-carlos',
	storageBucket: 'boda-america-y-carlos.firebasestorage.app',
	messagingSenderId: '1077064926354',
	appId: '1:1077064926354:web:15fdf0bd1ce9b8148a924b',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);