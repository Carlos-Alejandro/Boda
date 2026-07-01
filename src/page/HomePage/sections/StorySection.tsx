import { motion } from 'motion/react';

import { WeddingAudioPlayer } from '../components/WeddingAudioPlayer';
import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';

export function StorySection() {
	return (
		<section className="relative flex min-h-svh flex-col items-center overflow-hidden bg-[#FAF8F3] px-7 pt-20 pb-10 text-center text-[#5F5947]">
			<motion.img
				src={florInicioUp}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -left-1 top-0 w-72 select-none opacity-90"
				initial={{ opacity: 0, x: -12, y: -12, scale: 0.96 }}
				whileInView={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.2, ease: 'easeOut' }}
			/>

			<motion.img
				src={florInicioDown}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-3 right-0 w-76 select-none opacity-90"
				initial={{ opacity: 0, x: 14, y: 14, scale: 0.96 }}
				whileInView={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.1, duration: 1.2, ease: 'easeOut' }}
			/>

			<div className="relative z-10 mx-auto flex w-full max-w-[320px] flex-col items-center pt-20">
				<motion.p
					className="font-['Cinzel'] text-[0.64rem] font-medium uppercase leading-[2] tracking-[0.15em] text-[#6D6654]"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.85, ease: 'easeOut' }}
				>
					“Ya no son dos, sino uno solo.
					<br />
					Por tanto, lo que Dios ha unido,
					<br />
					que no lo separe el hombre.”
					<br />
					<span className="mt-2 block text-[0.58rem] tracking-[0.18em] text-[#8A806D]">
						(Mateo 19:6)
					</span>
				</motion.p>

				<motion.h2
					className="mt-12 font-['Allura'] text-[4.55rem] leading-[0.78] text-[#6F7563]"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.15, duration: 0.95, ease: 'easeOut' }}
				>
					<span className="block -translate-x-5">América</span>

					<span className="block py-3 font-['Allura'] text-[2.7rem] leading-none text-[#A98445]">
						&
					</span>

					<span className="block translate-x-6">Carlos</span>
				</motion.h2>

				<motion.div
					className="mt-12 flex w-full flex-col items-center"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.28, duration: 0.85, ease: 'easeOut' }}
				>
					<WeddingAudioPlayer startAtSeconds={0} />
				</motion.div>
			</div>
		</section>
	);
}