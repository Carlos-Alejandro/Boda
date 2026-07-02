import { motion } from 'motion/react';

import { WeddingAudioPlayer } from '../components/WeddingAudioPlayer';
import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';

const slowReveal = {
	hidden: { opacity: 0, y: 22, scale: 0.98 },
	visible: { opacity: 1, y: 0, scale: 1 },
};

export function StorySection() {
	return (
		<section className="relative flex min-h-svh flex-col items-center overflow-hidden bg-[#FAF8F3] px-7 pt-20 pb-10 text-center text-[#5F5947]">
			<motion.img
				src={florInicioUp}
				alt=""
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
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-3 right-0 w-76 select-none opacity-90"
				initial={{ opacity: 0, x: 24, y: 24, scale: 0.92, rotate: 4 }}
				whileInView={{ opacity: 0.9, x: 0, y: 0, scale: 1, rotate: 0 }}
				viewport={{ once: true, amount: 0.35 }}
				transition={{ delay: 0.25, duration: 1.8, ease: 'easeOut' }}
			/>

			<motion.div
				className="relative z-10 mx-auto flex w-full max-w-[320px] flex-col items-center pt-20"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.45 }}
			>
				<motion.p
					className="font-['Cinzel'] text-[0.64rem] font-medium uppercase leading-[2] tracking-[0.15em] text-[#6D6654]"
					variants={slowReveal}
					transition={{ duration: 1.35, ease: 'easeOut' }}
				>
					“Ya no son dos, sino uno solo.
					<br />
					Por tanto, lo que Dios ha unido,
					<br />
					que no lo separe el hombre.”
					<br />
					<motion.span
						className="mt-2 block text-[0.58rem] tracking-[0.18em] text-[#8A806D]"
						variants={slowReveal}
						transition={{ delay: 0.35, duration: 1.1, ease: 'easeOut' }}
					>
						(Mateo 19:6)
					</motion.span>
				</motion.p>

				<motion.h2
					className="mt-12 font-['Allura'] text-[4.55rem] leading-[0.78] text-[#6F7563]"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.45 }}
				>
					<motion.span
						className="block -translate-x-5"
						variants={{
							hidden: { opacity: 0, x: -26, y: 12, scale: 0.96 },
							visible: { opacity: 1, x: 0, y: 0, scale: 1 },
						}}
						transition={{ delay: 0.45, duration: 1.35, ease: 'easeOut' }}
					>
						América
					</motion.span>

					<motion.span
						className="block py-3 font-['Allura'] text-[2.7rem] leading-none text-[#A98445]"
						variants={{
							hidden: { opacity: 0, scale: 0.65, rotate: -8 },
							visible: { opacity: 1, scale: 1, rotate: 0 },
						}}
						transition={{ delay: 0.85, duration: 1.1, ease: 'easeOut' }}
					>
						&
					</motion.span>

					<motion.span
						className="block translate-x-6"
						variants={{
							hidden: { opacity: 0, x: 26, y: 12, scale: 0.96 },
							visible: { opacity: 1, x: 0, y: 0, scale: 1 },
						}}
						transition={{ delay: 1.15, duration: 1.35, ease: 'easeOut' }}
					>
						Carlos
					</motion.span>
				</motion.h2>

				<motion.div
					className="mt-12 flex w-full flex-col items-center"
					variants={slowReveal}
					transition={{ delay: 1.55, duration: 1.2, ease: 'easeOut' }}
				>
					<WeddingAudioPlayer startAtSeconds={0} />
				</motion.div>
			</motion.div>
		</section>
	);
}