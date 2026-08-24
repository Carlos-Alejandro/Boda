import { createContext, useContext } from 'react';

export interface WeddingAudioContextValue {
	isPlaying: boolean;
	progress: number;
	hasInteracted: boolean;
	play: () => Promise<void>;
	toggle: () => Promise<void>;
}

export const WeddingAudioContext = createContext<WeddingAudioContextValue | null>(null);

export function useWeddingAudio() {
	const context = useContext(WeddingAudioContext);

	if (!context) {
		throw new Error('useWeddingAudio must be used inside WeddingAudioProvider');
	}

	return context;
}
