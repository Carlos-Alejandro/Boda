import { motion } from 'motion/react';
import {
	CakeSlice,
	Camera,
	Church,
	GlassWater,
	PartyPopper,
	Sparkles,
	Utensils,
} from 'lucide-react';

import florInicioUp from '../../../assets/story/flor-inicio-up.png';
import florInicioDown from '../../../assets/story/flor-inicio-down.png';

const timelineItems = [
	{ time: '12:00 PM', label: 'Sesión de fotos', icon: Camera, side: 'left' },
	{ time: '1:00 PM', label: 'Ceremonia religiosa', icon: Church, side: 'right' },
	{ time: '3:00 PM', label: 'Recepción', icon: GlassWater, side: 'left' },
	{ time: '4:00 PM', label: 'Comida', icon: Utensils, side: 'right' },
	{ time: '5:00 PM', label: 'Brindis', icon: GlassWater, side: 'left' },
	{ time: '6:00 PM', label: 'Primer baile', icon: PartyPopper, side: 'right' },
	{ time: '7:00 PM', label: 'Pastel', icon: CakeSlice, side: 'left' },
	{ time: '8:00 PM', label: 'Fiesta', icon: Sparkles, side: 'right' },
] as const;

export function TimelineSection() {
	const leftItems = timelineItems.filter((item) => item.side === 'left');
	const rightItems = timelineItems.filter((item) => item.side === 'right');

	return (
		<section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#FAF8F3] px-6 p-12 text-center text-[#5F5947]">
			<motion.img
				src={florInicioUp}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -left-1 top-0 w-64 select-none opacity-75"
				initial={{ opacity: 0, x: -14, y: -14, scale: 0.96 }}
				whileInView={{ opacity: 0.75, x: 0, y: 0, scale: 1 }}
				animate={{
					y: [0, 6, 0],
					rotate: [0, -1.5, 0],
					scale: [1, 1.015, 1],
				}}
				viewport={{ once: true }}
				transition={{
					opacity: { duration: 1.2, ease: 'easeOut' },
					x: { duration: 1.2, ease: 'easeOut' },
					y: {
						duration: 5.4,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
					rotate: {
						duration: 6.2,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
					scale: {
						duration: 5.8,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
				}}
			/>

			<motion.img
				src={florInicioDown}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 right-0 w-64 select-none opacity-75"
				initial={{ opacity: 0, x: 18, y: 18, scale: 0.96 }}
				whileInView={{ opacity: 0.75, x: 0, y: 0, scale: 1 }}
				animate={{
					y: [0, -6, 0],
					rotate: [0, 1.5, 0],
					scale: [1, 1.015, 1],
				}}
				viewport={{ once: true }}
				transition={{
					opacity: { duration: 1.2, ease: 'easeOut' },
					x: { duration: 1.2, ease: 'easeOut' },
					y: {
						duration: 5,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
					rotate: {
						duration: 6,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
					scale: {
						duration: 5.5,
						repeat: Infinity,
						repeatType: 'mirror',
						ease: 'easeInOut',
					},
				}}
			/>

			<div className="relative z-10 mx-auto w-full max-w-[365px]">
				<motion.h2
					className="font-['Allura'] text-[2.6rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.85, ease: 'easeOut' }}
				>
					Itinerario de actividades
				</motion.h2>

				<div className="relative mx-auto mt-12 grid grid-cols-[1fr_32px_1fr] items-start">
					<motion.div
						className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#9BA58C]"
						initial={{ scaleY: 0, opacity: 0 }}
						whileInView={{ scaleY: 1, opacity: 1 }}
						viewport={{ once: true, amount: 0.45 }}
						transition={{ duration: 1.3, ease: 'easeOut' }}
						style={{ transformOrigin: 'top' }}
					/>

					<div className="space-y-12 pt-16">
						{leftItems.map(({ time, label, icon: Icon }, index) => (
							<motion.div
								key={`${time}-${label}`}
								className="grid grid-cols-[1fr_46px] items-center gap-2"
								initial={{ opacity: 0, x: -18 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.45 }}
								transition={{
									delay: index * 0.12,
									duration: 0.75,
									ease: 'easeOut',
								}}
							>
								<div className="text-right">
									<p className="font-['Cinzel'] text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#6F7563]">
										{time}
									</p>
									<p className="mt-1 font-['Cinzel'] text-[0.63rem] font-semibold uppercase leading-4 tracking-[0.15em]">
										{label}
									</p>
								</div>

								<Icon size={38} strokeWidth={1.35} className="text-[#7C8B68]" />
							</motion.div>
						))}
					</div>

					<div className="relative z-10 flex flex-col items-center gap-[72px] pt-7">
						{Array.from({ length: 4 }).map((_, index) => (
							<motion.span
								key={index}
								className="h-px w-8 bg-[#9BA58C]"
								initial={{ scaleX: 0, opacity: 0 }}
								whileInView={{ scaleX: 1, opacity: 1 }}
								viewport={{ once: true, amount: 0.45 }}
								transition={{
									delay: 0.35 + index * 0.14,
									duration: 0.55,
									ease: 'easeOut',
								}}
							/>
						))}
					</div>

					<div className="space-y-12">
						{rightItems.map(({ time, label, icon: Icon }, index) => (
							<motion.div
								key={`${time}-${label}`}
								className="grid grid-cols-[46px_1fr] items-center gap-2"
								initial={{ opacity: 0, x: 18 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.45 }}
								transition={{
									delay: index * 0.12,
									duration: 0.75,
									ease: 'easeOut',
								}}
							>
								<Icon size={38} strokeWidth={1.35} className="text-[#7C8B68]" />

								<div className="text-left">
									<p className="font-['Cinzel'] text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#6F7563]">
										{time}
									</p>
									<p className="mt-1 font-['Cinzel'] text-[0.63rem] font-semibold uppercase leading-4 tracking-[0.15em]">
										{label}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}