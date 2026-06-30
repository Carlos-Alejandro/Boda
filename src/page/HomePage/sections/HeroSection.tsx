import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Player } from '@lottiefiles/react-lottie-player';

import heroImage from '../../../assets/hero/hero-main2.jpeg';
import swipeUpAnimation from '../../../assets/animations/swipe-up.json';
import ornamentAnimation from '../../../assets/animations/Ornament.json';

const heroDelay = 1.3;

export function HeroSection() {
	const ornamentRef = useRef<Player>(null);

	useEffect(() => {
		const ornamentTimer = window.setTimeout(() => {
			ornamentRef.current?.play();
		}, (heroDelay + 3.2) * 1000);

		return () => {
			window.clearTimeout(ornamentTimer);
		};
	}, []);

	return (
		<section className="relative min-h-svh overflow-hidden">
			<img
				src={heroImage}
				alt="América y Carlos"
				className="absolute inset-0 h-full w-full object-cover"
			/>

			<div className="absolute inset-0 bg-[#5E6C4E]/42" />
			<div className="absolute inset-0 bg-gradient-to-b from-black/58 via-black/12 to-black/78" />

			<div className="relative z-10 flex min-h-svh flex-col items-center px-6 text-center text-[#FFF8EC]">
				<motion.div
					className="pt-[5svh]"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: heroDelay + 0.45, duration: 1, ease: 'easeOut' }}
				>
					<svg viewBox="0 0 300 90" className="h-20 w-72 overflow-visible">
						<path
							id="wedding-title-curve"
							d="M 35 70 Q 150 8 265 70"
							fill="transparent"
						/>

						<text className="fill-[#FFF8EC] font-['Cinzel'] text-[15px] font-semibold uppercase tracking-[0.38em]">
							<textPath href="#wedding-title-curve" startOffset="50%" textAnchor="middle">
								Nuestra boda
							</textPath>
						</text>
					</svg>
				</motion.div>

				<motion.div
					className="mt-2"
					initial={{ opacity: 0, y: 22 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: heroDelay + 0.9, duration: 1.1, ease: 'easeOut' }}
				>
					<h1 className="font-['Allura'] text-[5.8rem] font-normal leading-[0.78] tracking-normal drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
						<motion.span
							className="block"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: heroDelay + 1, duration: 1, ease: 'easeOut' }}
						>
							América
						</motion.span>

						<motion.span
							className="block py-2 font-['Allura'] text-[4rem] text-[#D8B46A]"
							initial={{ opacity: 0, scale: 0.85 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: heroDelay + 1.35, duration: 0.8, ease: 'easeOut' }}
						>
							&
						</motion.span>

						<motion.span
							className="block"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: heroDelay + 1.7, duration: 1, ease: 'easeOut' }}
						>
							Carlos
						</motion.span>
					</h1>
				</motion.div>

				<div className="flex-1" />

				<motion.div
					className="mb-[18svh] flex flex-col items-center"
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: heroDelay + 2.35, duration: 0.9, ease: 'easeOut' }}
				>
					<Player
						ref={ornamentRef}
						autoplay={false}
						loop={false}
						keepLastFrame
						src={ornamentAnimation}
						className="h-14 w-72 opacity-90"
					/>

					<p className="-mt-1 font-['Cinzel'] text-xs font-medium uppercase tracking-[0.42em] text-[#F6EAD4]">
						18 Marzo 2028
					</p>
				</motion.div>

				<motion.div
					className="absolute bottom-14 flex flex-col items-center"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: heroDelay + 5.6, duration: 1, ease: 'easeOut' }}
				>
					<Player
						autoplay
						loop
						src={swipeUpAnimation}
						className="h-16 w-16 opacity-90"
					/>
				</motion.div>
			</div>
		</section>
	);
}