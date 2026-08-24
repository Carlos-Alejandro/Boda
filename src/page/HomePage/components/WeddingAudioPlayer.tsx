import { AnimatePresence, motion } from 'motion/react';
import {
	Pause,
	Play,
	Repeat2,
	Shuffle,
	SkipBack,
	SkipForward,
} from 'lucide-react';

import { useWeddingAudio } from '../../../audio/WeddingAudioContext';

interface WeddingAudioPlayerProps {
	className?: string;
}

export function WeddingAudioPlayer({
	className = '',
}: WeddingAudioPlayerProps) {
	const { isPlaying, progress, hasInteracted, toggle } = useWeddingAudio();

	return (
		<div className={`flex flex-col items-center ${className}`}>
			<p className="font-['Allura'] text-[1.75rem] leading-none text-[#A98445]">Que suene el amor</p>

			<div className="mt-3 flex h-3 items-end justify-center gap-1" aria-hidden="true">
				{[0.55, 1, 0.72, 0.9, 0.48].map((height, index) => (
					<motion.span
						key={index}
						className="w-[2px] rounded-full bg-[#A98445]/70"
						animate={{ height: isPlaying ? [`${height * 5}px`, `${height * 12}px`, `${height * 5}px`] : '3px' }}
						transition={{ duration: 0.75, repeat: isPlaying ? Infinity : 0, delay: index * 0.08, ease: 'easeInOut' }}
					/>
				))}
			</div>

			<div className="mt-3 h-[2px] w-[230px] rounded-full bg-[#7C8B68]/35">
				<div
					className="relative h-full rounded-full bg-[#7C8B68] transition-[width] duration-300"
					style={{ width: `${progress}%` }}
				>
					<span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#7C8B68] shadow-[0_2px_8px_rgba(124,139,104,0.35)]" />
				</div>
			</div>

			<div className="mt-4 flex items-center justify-center gap-5 text-[#7C8B68]">
				<button type="button" aria-label="Aleatorio" className="opacity-80">
					<Shuffle size={15} strokeWidth={1.8} />
				</button>

				<button type="button" aria-label="Anterior" className="opacity-85">
					<SkipBack size={17} fill="currentColor" strokeWidth={1.6} />
				</button>

				<motion.button
					type="button"
					aria-label={isPlaying ? 'Pausar canción' : 'Reproducir canción'}
					onClick={() => void toggle()}
					className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#7C8B68] text-[#FFF8EC] shadow-[0_18px_38px_rgba(95,89,71,0.22)]"
					whileTap={{ scale: 0.92 }}
				>
					{!hasInteracted && !isPlaying && (
						<motion.span
							className="pointer-events-none absolute inset-0 rounded-full border border-[#A98445]/65"
							animate={{ opacity: [0.7, 0], scale: [1, 1.45] }}
							transition={{ duration: 1.7, repeat: 2, ease: 'easeOut' }}
						/>
					)}
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
				</motion.button>

				<button type="button" aria-label="Siguiente" className="opacity-85">
					<SkipForward size={17} fill="currentColor" strokeWidth={1.6} />
				</button>

				<button type="button" aria-label="Repetir" className="opacity-80">
					<Repeat2 size={15} strokeWidth={1.8} />
				</button>
			</div>

			<AnimatePresence>
				{!hasInteracted && !isPlaying && (
					<motion.p
						className="mt-3 font-['Cinzel'] text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#A98445]"
						initial={{ opacity: 0, y: -3 }} animate={{ opacity: 0.85, y: 0 }} exit={{ opacity: 0, height: 0, margin: 0 }}
					>
						Toca para escuchar
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}
