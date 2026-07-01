import { useEffect, useRef, useState } from 'react';
import {
	Pause,
	Play,
	Repeat2,
	Shuffle,
	SkipBack,
	SkipForward,
} from 'lucide-react';

import weddingSong from '../../../assets/audio/wedding-song2.mp3';

interface WeddingAudioPlayerProps {
	className?: string;
	startAtSeconds?: number;
}

export function WeddingAudioPlayer({
	className = '',
	startAtSeconds = 0,
}: WeddingAudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.volume = 0.55;

		const handleLoadedMetadata = () => {
			audio.currentTime = startAtSeconds;
		};

		audio.addEventListener('loadedmetadata', handleLoadedMetadata);

		audio
			.play()
			.then(() => setIsPlaying(true))
			.catch(() => setIsPlaying(false));

		return () => {
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
		};
	}, [startAtSeconds]);

	const toggleAudio = async () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (audio.paused) {
			await audio.play();
			setIsPlaying(true);
			return;
		}

		audio.pause();
		setIsPlaying(false);
	};

	const handleTimeUpdate = () => {
		const audio = audioRef.current;
		if (!audio || !audio.duration) return;

		setProgress((audio.currentTime / audio.duration) * 100);
	};

	return (
		<div className={`flex flex-col items-center ${className}`}>
			<audio
				ref={audioRef}
				src={weddingSong}
				loop
				onTimeUpdate={handleTimeUpdate}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>

			<p className="font-['Cormorant_Garamond'] text-[0.98rem] italic text-[#6D6654]">
				Que suene el amor
			</p>

			<div className="mt-5 h-[2px] w-[230px] rounded-full bg-[#7C8B68]/35">
				<div
					className="relative h-full rounded-full bg-[#7C8B68] transition-[width] duration-300"
					style={{ width: `${progress}%` }}
				>
					<span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#7C8B68] shadow-[0_2px_8px_rgba(124,139,104,0.35)]" />
				</div>
			</div>

			<div className="mt-5 flex items-center justify-center gap-5 text-[#7C8B68]">
				<button type="button" aria-label="Aleatorio" className="opacity-80">
					<Shuffle size={15} strokeWidth={1.8} />
				</button>

				<button type="button" aria-label="Anterior" className="opacity-85">
					<SkipBack size={17} fill="currentColor" strokeWidth={1.6} />
				</button>

				<button
					type="button"
					aria-label={isPlaying ? 'Pausar canción' : 'Reproducir canción'}
					onClick={toggleAudio}
					className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7C8B68] text-[#FFF8EC] shadow-[0_18px_38px_rgba(95,89,71,0.22)] transition-transform duration-300 active:scale-95"
				>
					{isPlaying ? (
						<Pause size={22} fill="currentColor" strokeWidth={1.8} />
					) : (
						<Play
							size={22}
							fill="currentColor"
							strokeWidth={1.8}
							className="translate-x-0.5"
						/>
					)}
				</button>

				<button type="button" aria-label="Siguiente" className="opacity-85">
					<SkipForward size={17} fill="currentColor" strokeWidth={1.6} />
				</button>

				<button type="button" aria-label="Repetir" className="opacity-80">
					<Repeat2 size={15} strokeWidth={1.8} />
				</button>
			</div>
		</div>
	);
}