import { CircleSlash2, Heart, Shirt, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

import formalAttire from '../../../assets/dresscode/formal-attire-watercolor.png';

export function DressCodeSection() {
	return (
		<section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#FAF8F3] px-6 py-14 text-center text-[#5F5947]">
			<div className="mx-auto w-full max-w-[350px]">

				<motion.h2
					className="mt-2 font-['Allura'] text-[3.2rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ delay: 0.08, duration: 0.8, ease: 'easeOut' }}
				>
					Código de vestimenta
				</motion.h2>

				<motion.div
					className="relative mt-7 rounded-[2.2rem] border border-[#CDBA93]/75 bg-[#FFFDF8] p-2 shadow-[0_20px_55px_rgba(95,89,71,0.11)]"
					initial={{ opacity: 0, y: 24, scale: 0.98 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ delay: 0.14, duration: 0.85, ease: 'easeOut' }}
				>
					<div className="overflow-hidden rounded-[1.75rem] border border-[#A98445]/20">
						<div className="relative bg-[#28281F]">
							<motion.img
								src={formalAttire}
								alt="Vestido formal en tonos oliva y traje oscuro elegante"
								loading="lazy"
								decoding="async"
								className="h-[285px] w-full object-contain"
								initial={{ opacity: 0, scale: 1.04 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true, amount: 0.35 }}
								transition={{ delay: 0.25, duration: 1, ease: 'easeOut' }}
							/>
							<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#28281F] to-transparent" />
							<motion.div
								className="absolute inset-x-0 bottom-4 flex justify-center"
								initial={{ opacity: 0, y: 8 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.55, duration: 0.7 }}
							>
								<span className="inline-flex items-center gap-2 rounded-full border border-[#D7BC7D]/45 bg-black/25 px-5 py-2 font-['Cinzel'] text-[0.63rem] font-semibold uppercase tracking-[0.2em] text-[#FFF5DB] backdrop-blur-md">
									<Sparkles size={13} strokeWidth={1.5} /> Formal / Elegante
								</span>
							</motion.div>
						</div>

						<div className="bg-[#FFFDF8] px-5 pb-6 pt-5">
							<div className="grid grid-cols-2 divide-x divide-[#D8CDB9]">
								<motion.div
									className="px-3"
									initial={{ opacity: 0, x: -14 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.35, duration: 0.65 }}
								>
									<Heart size={18} strokeWidth={1.35} className="mx-auto text-[#7C8B68]" />
									<p className="mt-2 font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#A98445]">Ellas</p>
									<p className="mt-2 text-[0.76rem] leading-5 text-[#5F5947]">Vestido formal o de noche.</p>
								</motion.div>

								<motion.div
									className="px-3"
									initial={{ opacity: 0, x: 14 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.42, duration: 0.65 }}
								>
									<Shirt size={18} strokeWidth={1.35} className="mx-auto text-[#7C8B68]" />
									<p className="mt-2 font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#A98445]">Ellos</p>
									<p className="mt-2 text-[0.76rem] leading-5 text-[#5F5947]">Traje y calzado formal.</p>
								</motion.div>
							</div>

							<motion.div
								className="mx-auto mt-5 flex max-w-[270px] items-center justify-center gap-3 rounded-2xl border border-[#D8CDB9] bg-[#F7F3EA] px-4 py-3"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.5, duration: 0.65 }}
							>
								<span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#C9BDA8] bg-white shadow-sm">
									<CircleSlash2 size={20} strokeWidth={1.25} className="text-[#A98445]" />
								</span>
								<p className="text-left font-['Cinzel'] text-[0.55rem] font-semibold uppercase leading-4 tracking-[0.12em] text-[#6D6654]">
									El color blanco está reservado para la novia
								</p>
							</motion.div>
						</div>
					</div>
				</motion.div>

				<motion.p
					className="mx-auto mt-6 font-['Allura'] text-[1.75rem] text-[#7C8B68]"
					initial={{ opacity: 0, y: 8 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4, duration: 0.7 }}
				>
					Vístete para celebrar
				</motion.p>
			</div>
		</section>
	);
}
