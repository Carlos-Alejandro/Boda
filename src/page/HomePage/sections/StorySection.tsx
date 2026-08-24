import { motion } from 'motion/react';

import florInicioDown from '../../../assets/story/flor-inicio-down.png';
import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import { WeddingAudioPlayer } from '../components/WeddingAudioPlayer';

const slowReveal = {
	hidden: { opacity: 0, y: 20, scale: 0.98 },
	visible: { opacity: 1, y: 0, scale: 1 },
};

export function StorySection() {
	return (
		<section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#FAF8F3] px-7 py-12 text-center text-[#5F5947]">
			<motion.img
				src={florInicioUp}
				alt=""
				loading="lazy"
				decoding="async"
				aria-hidden="true"
				className="pointer-events-none absolute -left-1 top-0 w-72 select-none opacity-90"
				initial={{ opacity: 0, x: -24, y: -24, scale: 0.92, rotate: -4 }}
				whileInView={{ opacity: 0.9, x: 0, y: 0, scale: 1, rotate: 0 }}
				viewport={{ once: true, amount: 0.35 }}
				transition={{ duration: 1.8, ease: 'easeOut' }}
			/>

			<motion.img
				src={florInicioDown}
				alt=""
				loading="lazy"
				decoding="async"
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-3 right-0 w-76 select-none opacity-90"
				initial={{ opacity: 0, x: 24, y: 24, scale: 0.92, rotate: 4 }}
				whileInView={{ opacity: 0.9, x: 0, y: 0, scale: 1, rotate: 0 }}
				viewport={{ once: true, amount: 0.35 }}
				transition={{ delay: 0.25, duration: 1.8, ease: 'easeOut' }}
			/>

			<motion.div
				className="relative z-10 mx-auto flex w-full max-w-[320px] flex-col items-center"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.35 }}
			>
				<motion.p
					className="font-['Cinzel'] text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#7C8B68]"
					variants={slowReveal}
					transition={{ duration: 0.9, ease: 'easeOut' }}
				>
					Dos almas, un camino
				</motion.p>

				<motion.div
					className="relative mt-4 w-full border-y border-[#A98445]/20 px-5 py-5"
					variants={slowReveal}
					transition={{ delay: 0.15, duration: 1.1, ease: 'easeOut' }}
				>
					<span aria-hidden="true" className="absolute -top-4 left-2 font-['Allura'] text-[3.2rem] leading-none text-[#A98445]/45">“</span>
					<span aria-hidden="true" className="absolute -bottom-8 right-2 font-['Allura'] text-[3.2rem] leading-none text-[#A98445]/45">”</span>
					<p className="font-['Cinzel'] text-[0.63rem] font-medium uppercase leading-[1.9] tracking-[0.13em] text-[#6D6654]">
						Ya no son dos, sino uno solo.
						<br />
						Por tanto, lo que Dios ha unido,
						<br />
						que no lo separe el hombre.
					</p>
					<p className="mt-2 font-['Cinzel'] text-[0.55rem] tracking-[0.18em] text-[#8A806D]">Mateo 19:6</p>
				</motion.div>

				<motion.h2 className="mt-8 font-['Allura'] text-[4.35rem] leading-[0.76] text-[#6F7563]">
					<motion.span
						className="block -translate-x-5"
						variants={{ hidden: { opacity: 0, x: -26, y: 10 }, visible: { opacity: 1, x: 0, y: 0 } }}
						transition={{ delay: 0.45, duration: 1.2, ease: 'easeOut' }}
					>
						América
					</motion.span>

					<motion.span
						className="relative mx-auto block w-fit py-2 font-['Allura'] text-[2.5rem] leading-none text-[#A98445]"
						variants={{ hidden: { opacity: 0, scale: 0.5, rotate: -10 }, visible: { opacity: 1, scale: 1, rotate: 0 } }}
						transition={{ delay: 0.78, duration: 0.9, ease: 'easeOut' }}
						animate={{ scale: [1, 1.1, 1] }}
					>
						&
					</motion.span>

					<motion.span
						className="block translate-x-6"
						variants={{ hidden: { opacity: 0, x: 26, y: 10 }, visible: { opacity: 1, x: 0, y: 0 } }}
						transition={{ delay: 1.02, duration: 1.2, ease: 'easeOut' }}
					>
						Carlos
					</motion.span>
				</motion.h2>

				<motion.div
					className="mt-7 flex w-36 items-center gap-3 text-[#A98445]"
					variants={slowReveal}
					transition={{ delay: 1.25, duration: 0.9 }}
				>
					<span className="h-px flex-1 bg-[#A98445]/40" />
					<span className="text-xs">♥</span>
					<span className="h-px flex-1 bg-[#A98445]/40" />
				</motion.div>

				<motion.div
					className="mt-6 flex w-full flex-col items-center"
					variants={slowReveal}
					transition={{ delay: 1.4, duration: 1.1, ease: 'easeOut' }}
				>
					<WeddingAudioPlayer />
				</motion.div>
			</motion.div>
		</section>
	);
}
