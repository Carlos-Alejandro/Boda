import { motion } from 'motion/react';

import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';

export function StorySection() {
	return (
		<section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#FAF8F3] px-7 text-center text-[#5F5947]">
			<img
				src={florInicioUp}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute left-1 top-0 w-74 select-none opacity-90"
			/>

			<img
				src={florInicioDown}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-2 right-0 w-74 select-none opacity-90"
			/>

			<div className="relative z-10 mx-auto flex w-full max-w-[320px] flex-col items-center justify-center">
				<motion.p
					className="font-['Cinzel'] text-[0.62rem] font-medium leading-6 tracking-[0.12em]"
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					“Ya no son dos, sino uno solo.
					<br />
					Por tanto, lo que Dios ha unido,
					<br />
					que no lo separe el hombre.”
					<br />
					<span className="text-[0.58rem] tracking-[0.14em]">
						(Mateo 19:6)
					</span>
				</motion.p>

				<motion.h2
					className="mt-11 font-['Allura'] text-[4.8rem] leading-[0.78] text-[#6F7563]"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.15, duration: 0.9 }}
				>
					América
					<span className="block py-3 text-[2.9rem] text-[#A98445]">
						&
					</span>
					Carlos
				</motion.h2>

				<motion.div
					className="mt-11"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.25, duration: 0.8 }}
				>
					<p className="font-['Cormorant_Garamond'] text-base italic">
						Dale play a nuestra canción
					</p>

					<div className="mt-5 flex items-center justify-center gap-7 text-[#7C8B68]">
						<span className="text-xl">←</span>

						<button
							type="button"
							className="flex h-13 w-13 items-center justify-center rounded-full bg-[#7C8B68] text-white shadow-[0_14px_30px_rgba(95,89,71,0.18)]"
						>
							▶
						</button>

						<span className="text-xl">→</span>
					</div>
				</motion.div>
			</div>
		</section>
	);
}