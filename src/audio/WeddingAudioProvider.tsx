import { type ReactNode, useCallback, useRef, useState } from 'react';

import weddingSong from '../assets/audio/wedding-song2.mp3';
import { WeddingAudioContext } from './WeddingAudioContext';

export function WeddingAudioProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const hasPreparedAudioRef = useRef(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [hasInteracted, setHasInteracted] = useState(false);

	const prepareAudio = useCallback(() => {
		const audio = audioRef.current;
		if (!audio || hasPreparedAudioRef.current) return;

		hasPreparedAudioRef.current = true;
		try {
			audio.preload = 'auto';
			audio.load();
		} catch {
			hasPreparedAudioRef.current = false;
		}
	}, []);

	const play = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		setHasInteracted(true);
		try {
			await audio.play();
		} catch {
			setIsPlaying(false);
		}
	};

	const toggle = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		setHasInteracted(true);
		if (audio.paused) {
			await play();
			return;
		}

		audio.pause();
	};

	return (
		<WeddingAudioContext.Provider
			value={{ isPlaying, progress, hasInteracted, prepareAudio, play, toggle }}
		>
			<audio
				ref={audioRef}
				src={weddingSong}
				preload="none"
				loop
				onLoadedMetadata={(event) => {
					event.currentTarget.volume = 0.55;
				}}
				onTimeUpdate={(event) => {
					const audio = event.currentTarget;
					if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
				}}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>
			{children}
		</WeddingAudioContext.Provider>
	);
}
