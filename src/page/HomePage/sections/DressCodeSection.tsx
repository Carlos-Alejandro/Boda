import { motion } from 'motion/react';
import { Heart, Shirt, Sparkles } from 'lucide-react';

export function DressCodeSection() {
	return (
		<section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#FAF8F3] px-7 py-12 text-center text-[#5F5947]">

			<div className="relative z-10 mx-auto w-full max-w-[365px]">
				<motion.p
					className="font-['Cinzel'] text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#7C8B68]"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.45 }}
					transition={{ duration: 0.75, ease: 'easeOut' }}
				>
					Invitados
				</motion.p>

				<motion.h2
					className="mt-2 font-['Allura'] text-[3rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.45 }}
					transition={{ delay: 0.08, duration: 0.85, ease: 'easeOut' }}
				>
					Código de vestimenta
				</motion.h2>

				<motion.div
					className="mx-auto mt-8 rounded-[2rem] border border-[#9BA58C]/45 bg-[#FCFBF8]/70 px-6 py-8 shadow-[0_18px_45px_rgba(95,89,71,0.08)] backdrop-blur-sm"
					initial={{ opacity: 0, y: 22, scale: 0.97 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					viewport={{ once: true, amount: 0.35 }}
					transition={{ delay: 0.14, duration: 0.85, ease: 'easeOut' }}
				>
					<motion.div
						className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#A98445]/45 bg-[#FAF8F3]"
						initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
						whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.25, duration: 0.75, ease: 'easeOut' }}
					>
						<Sparkles size={30} strokeWidth={1.35} className="text-[#A98445]" />
					</motion.div>

					<p className="mt-5 font-['Cinzel'] text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-[#7C8B68]">
						Formal / Elegante
					</p>

					<p className="mx-auto mt-5 max-w-[280px] text-[0.9rem] leading-6 text-[#5F5947]">
						Queremos que te sientas cómodo y disfrutes cada momento con nosotros.
					</p>

					<p className="mx-auto mt-3 max-w-[280px] text-[0.86rem] leading-6 text-[#5F5947]">
						Te sugerimos vestir formal y evitar el color blanco, reservado para la novia.
					</p>

					<div className="mt-7 grid grid-cols-2 gap-3">
						<motion.div
							className="rounded-2xl border border-[#9BA58C]/35 bg-[#FAF8F3]/75 px-3 py-4"
							initial={{ opacity: 0, x: -14 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3, duration: 0.65, ease: 'easeOut' }}
						>
							<Heart size={25} strokeWidth={1.3} className="mx-auto text-[#7C8B68]" />
							<p className="mt-3 font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#A98445]">
								Ellas
							</p>
							<p className="mt-2 text-[0.75rem] leading-5 text-[#5F5947]">
								Vestido formal o de noche.
							</p>
						</motion.div>

						<motion.div
							className="rounded-2xl border border-[#9BA58C]/35 bg-[#FAF8F3]/75 px-3 py-4"
							initial={{ opacity: 0, x: 14 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.36, duration: 0.65, ease: 'easeOut' }}
						>
							<Shirt size={25} strokeWidth={1.3} className="mx-auto text-[#7C8B68]" />
							<p className="mt-3 font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#A98445]">
								Ellos
							</p>
							<p className="mt-2 text-[0.75rem] leading-5 text-[#5F5947]">
								Traje, camisa y calzado formal.
							</p>
						</motion.div>
					</div>

					<p className="mx-auto mt-7 max-w-[250px] font-['Cinzel'] text-[0.58rem] font-semibold uppercase leading-5 tracking-[0.16em] text-[#7C8B68]">
						Gracias por acompañarnos con tanto cariño.
					</p>
				</motion.div>
			</div>
		</section>
	);
}