import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Player } from '@lottiefiles/react-lottie-player';
import { MapPin } from 'lucide-react';

import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';
import churchAnimation from '../../../assets/animations/Church.json';
import celebrationAnimation from '../../../assets/animations/celebration.json';

export function LocationSection() {
	const churchRef = useRef<Player>(null);
	const celebrationRef = useRef<Player>(null);

	const [hasPlayedChurch, setHasPlayedChurch] = useState(false);
	const [hasPlayedCelebration, setHasPlayedCelebration] = useState(false);

	const playChurchAnimation = () => {
		churchRef.current?.stop();
		churchRef.current?.play();
	};

	const playCelebrationAnimation = () => {
		celebrationRef.current?.stop();
		celebrationRef.current?.play();
	};

	const handleChurchEnter = () => {
		if (hasPlayedChurch) return;

		setHasPlayedChurch(true);
		playChurchAnimation();
	};

	const handleCelebrationEnter = () => {
		if (hasPlayedCelebration) return;

		setHasPlayedCelebration(true);
		playCelebrationAnimation();
	};

	return (
		<section className="relative flex min-h-svh items-center overflow-hidden bg-[#FAF8F3] px-7 py-16 text-center text-[#5F5947]">
			<motion.img
				src={florInicioUp}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -left-1 top-0 w-64 select-none opacity-85"
				initial={{ opacity: 0, x: -14, y: -14, scale: 0.96 }}
				whileInView={{ opacity: 0.85, x: 0, y: 0, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.2, ease: 'easeOut' }}
			/>

			<motion.img
				src={florInicioDown}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-3 right-0 w-72 select-none opacity-85"
				initial={{ opacity: 0, x: 14, y: 14, scale: 0.96 }}
				whileInView={{ opacity: 0.85, x: 0, y: 0, scale: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.1, duration: 1.2, ease: 'easeOut' }}
			/>

			<div className="relative z-10 mx-auto w-full max-w-[315px] space-y-14">
				<motion.article
					className="flex flex-col items-center"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.45 }}
					transition={{ duration: 0.85, ease: 'easeOut' }}
					onViewportEnter={handleChurchEnter}
				>
					<button
						type="button"
						aria-label="Reproducir animación de iglesia"
						onClick={playChurchAnimation}
						className="mb-4 flex h-20 w-20 items-center justify-center"
					>
						<Player
							ref={churchRef}
							autoplay={false}
							loop={false}
							keepLastFrame
							src={churchAnimation}
							className="h-20 w-20"
						/>
					</button>

					<p className="font-['Cinzel'] text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-[#6F7563]">
						Ceremonia religiosa
					</p>

					<h2 className="mt-3 font-['Allura'] text-[2.9rem] leading-none text-[#A98445]">
						Iglesia San Pedro
					</h2>

					<div className="mt-4 flex items-start justify-center gap-2 text-[0.82rem] italic leading-6 text-[#5F5947]">
						<MapPin
							size={15}
							strokeWidth={1.7}
							className="mt-1 shrink-0 text-[#7C8B68]"
						/>
						<span>Calle Tarija y Av. América</span>
					</div>

					<a
						href="https://maps.google.com"
						target="_blank"
						rel="noreferrer"
						className="mt-6 rounded-full bg-[#7C8B68] px-7 py-3 font-['Cinzel'] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FFF8EC] shadow-[0_14px_30px_rgba(95,89,71,0.16)] transition-transform duration-300 active:scale-95"
					>
						Ver ubicación
					</a>
				</motion.article>

				<motion.article
					className="flex flex-col items-center"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.45 }}
					transition={{ delay: 0.12, duration: 0.85, ease: 'easeOut' }}
					onViewportEnter={handleCelebrationEnter}
				>
					<button
						type="button"
						aria-label="Reproducir animación de celebración"
						onClick={playCelebrationAnimation}
						className="mb-4 flex h-20 w-20 items-center justify-center"
					>
						<Player
							ref={celebrationRef}
							autoplay={false}
							loop={false}
							keepLastFrame
							src={celebrationAnimation}
							className="h-20 w-20"
						/>
					</button>

					<p className="font-['Cinzel'] text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-[#6F7563]">
						Celebración
					</p>

					<h2 className="mt-3 font-['Allura'] text-[2.9rem] leading-none text-[#A98445]">
						Jardín Padilla
					</h2>

					<div className="mt-4 flex items-start justify-center gap-2 text-[0.82rem] italic leading-6 text-[#5F5947]">
						<MapPin
							size={15}
							strokeWidth={1.7}
							className="mt-1 shrink-0 text-[#7C8B68]"
						/>
						<span>Calle Sucre y 16 de Julio</span>
					</div>

					<a
						href="https://maps.google.com"
						target="_blank"
						rel="noreferrer"
						className="mt-6 rounded-full bg-[#7C8B68] px-7 py-3 font-['Cinzel'] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FFF8EC] shadow-[0_14px_30px_rgba(95,89,71,0.16)] transition-transform duration-300 active:scale-95"
					>
						Ver ubicación
					</a>
				</motion.article>
			</div>
		</section>
	);
}