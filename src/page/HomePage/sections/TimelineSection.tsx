import { motion } from 'motion/react';
import {
	CakeSlice,
	Camera,
	Church,
	GlassWater,
	Heart,
	PartyPopper,
	Sparkles,
	Utensils,
} from 'lucide-react';

import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';

const timelineItems = [
	{ time: '4:00 PM', label: 'Ceremonia religiosa', icon: Church, side: 'left' },
	{ time: '5:00 PM', label: 'Sesión de fotos de los novios', icon: Camera, side: 'right' },
	{ time: '6:00 PM', label: 'Comienza la celebración', icon: Sparkles, side: 'left' },
	{ time: '6:30 PM', label: 'Entrada de los novios', icon: Heart, side: 'right' },
	{ time: '7:00 PM', label: 'Cena y banquete', icon: Utensils, side: 'left' },
	{ time: '8:00 PM', label: 'Brindis', icon: GlassWater, side: 'right' },
	{ time: '9:00 PM', label: 'Corte de pastel, ramo y liga', icon: CakeSlice, side: 'left' },
	{ time: '10:00 PM', label: 'Baile y fiesta', icon: PartyPopper, side: 'right' },
	{ time: '11:00 PM', label: 'Fin del evento', icon: Sparkles, side: 'left' },
] as const;

export function TimelineSection() {
	return (
		<section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#FAF8F3] px-6 py-10 text-center text-[#5F5947]">
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

			<div className="relative z-10 mx-auto w-full max-w-[365px]">
				<motion.h2
					className="font-['Allura'] text-[2.35rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.85, ease: 'easeOut' }}
				>
					Itinerario de actividades
				</motion.h2>

				<div className="relative mx-auto mt-8">
					<motion.div
						className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#9BA58C]"
						initial={{ scaleY: 0, opacity: 0 }}
						whileInView={{ scaleY: 1, opacity: 1 }}
						viewport={{ once: true, amount: 0.45 }}
						transition={{ duration: 1.3, ease: 'easeOut' }}
						style={{ transformOrigin: 'top' }}
					/>

					<div className="flex w-full flex-col gap-5">
						{timelineItems.map(({ time, label, icon: Icon, side }, index) => {
							const isLeft = side === 'left';

							return (
								<motion.div
									key={`${time}-${label}`}
									className="grid grid-cols-[1fr_32px_1fr] items-center"
									initial={{ opacity: 0, x: isLeft ? -18 : 18 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true, amount: 0.45 }}
									transition={{
										delay: index * 0.08,
										duration: 0.7,
										ease: 'easeOut',
									}}
								>
									<div className={isLeft ? 'flex items-center justify-end gap-2' : ''}>
										{isLeft && (
											<>
												<p className="max-w-[112px] text-right font-['Cinzel'] text-[0.56rem] font-semibold uppercase leading-[0.9rem] tracking-[0.12em]">
													<span className="mb-0.5 block text-[0.52rem] tracking-[0.15em] text-[#A98445]">
														{time}
													</span>
													{label}
												</p>

												<Icon size={29} strokeWidth={1.35} className="shrink-0 text-[#7C8B68]" />
											</>
										)}
									</div>

									<div className="relative z-10 flex items-center justify-center">
										<motion.span
											className="h-px w-8 bg-[#9BA58C]"
											initial={{ scaleX: 0, opacity: 0 }}
											whileInView={{ scaleX: 1, opacity: 1 }}
											viewport={{ once: true, amount: 0.45 }}
											transition={{
												delay: 0.25 + index * 0.08,
												duration: 0.45,
												ease: 'easeOut',
											}}
										/>
									</div>

									<div className={!isLeft ? 'flex items-center justify-start gap-2' : ''}>
										{!isLeft && (
											<>
												<Icon size={29} strokeWidth={1.35} className="shrink-0 text-[#7C8B68]" />

												<p className="max-w-[112px] text-left font-['Cinzel'] text-[0.56rem] font-semibold uppercase leading-[0.9rem] tracking-[0.12em]">
													<span className="mb-0.5 block text-[0.52rem] tracking-[0.15em] text-[#A98445]">
														{time}
													</span>
													{label}
												</p>
											</>
										)}
									</div>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}