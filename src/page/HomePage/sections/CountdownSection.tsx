import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import florInicioDown from '../../../assets/story/flor-inicio-down.png';
import avesListon from '../../../assets/story/aves-liston.png';

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

const weddingDate = new Date('2028-03-18T16:00:00');

export function CountdownSection() {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	useEffect(() => {
		const calculateTimeLeft = () => {
			const difference = weddingDate.getTime() - new Date().getTime();

			if (difference <= 0) return;

			setTimeLeft({
				days: Math.floor(difference / (1000 * 60 * 60 * 24)),
				hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
				minutes: Math.floor((difference / (1000 * 60)) % 60),
				seconds: Math.floor((difference / 1000) % 60),
			});
		};

		calculateTimeLeft();

		const timer = window.setInterval(calculateTimeLeft, 1000);

		return () => window.clearInterval(timer);
	}, []);

	return (
		<section className="relative flex min-h-svh flex-col items-center overflow-hidden bg-[#FAF8F3] px-7 py-10 text-center text-[#5F5947]">
			<motion.img
				src={florInicioDown}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-3 -left-1 w-72 -scale-x-100 select-none opacity-85"
				initial={{ opacity: 0, x: -14, y: 14, scale: 0.96 }}
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

			<div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[315px] flex-col items-center justify-start -mt-5">
				<motion.img
					src={avesListon}
					alt=""
					aria-hidden="true"
					className=" w-full max-w-[285px] -translate-y-9 select-none"
					initial={{ opacity: 0, y: 16, scale: 0.98 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.9, ease: 'easeOut' }}
				/>

				<motion.p
					className="font-['Cinzel'] -mt-20 text-[0.75rem] font-medium uppercase leading-[1.95] tracking-[0.14em] text-[#6D6654]"
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.22, duration: 1.25, ease: 'easeOut' }}
				>
					Con el amor que nos une,
					<br />
					la bendición de Dios y el apoyo
					<br />
					de nuestros padres, te invitamos
					<br />
					a celebrar el día más especial
					<br />
					de nuestras vidas.
				</motion.p>

				<motion.div
					className="mt-11 w-full font-['Cinzel'] text-[#A98445]"
					initial={{ opacity: 0, y: 22 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.42, duration: 1.25, ease: 'easeOut' }}
				>
					<p className="text-[0.78rem] font-semibold uppercase tracking-[0.38em]">
						Marzo
					</p>

					<div className="mx-auto mt-2 grid max-w-[285px] grid-cols-[1fr_auto_1fr] items-center gap-3">
						<div className="flex flex-col gap-3">
							<span className="h-px w-full bg-[#6F7563]/55" />
							<span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[#A98445]">
								Sábado
							</span>
							<span className="h-px w-full bg-[#6F7563]/55" />
						</div>

						<motion.p
							className="font-['Allura'] text-[5rem] leading-none text-[#6F7563]"
							initial={{ opacity: 0, scale: 0.82 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.72, duration: 1.3, ease: 'easeOut' }}
						>
							18
						</motion.p>

						<div className="flex flex-col gap-3">
							<span className="h-px w-full bg-[#6F7563]/55" />
							<span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[#A98445]">
								2028
							</span>
							<span className="h-px w-full bg-[#6F7563]/55" />
						</div>
					</div>
				</motion.div>

				<motion.div
					className="mt-11"
					initial={{ opacity: 0, y: 22 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.62, duration: 1.25, ease: 'easeOut' }}
				>
					<p className="font-['Cinzel'] text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#6F7563]">
						Faltan
					</p>

					<div className="mt-5 flex items-start justify-center gap-2 font-['Cinzel'] text-[#6F7563]">
						{[
							{ label: 'Días', value: timeLeft.days, width: 'w-16' },
							{ label: 'Horas', value: timeLeft.hours, width: 'w-11' },
							{ label: 'Min', value: timeLeft.minutes, width: 'w-11' },
							{ label: 'Seg', value: timeLeft.seconds, width: 'w-11' },
						].map((item, index) => (
							<motion.div
								key={item.label}
								className="flex items-start"
								initial={{ opacity: 0, y: 12 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									delay: 0.82 + index * 0.12,
									duration: 0.9,
									ease: 'easeOut',
								}}
							>
								<div className={item.width}>
									<p className="text-[1.75rem] leading-none">
										{String(item.value).padStart(2, '0')}
									</p>

									<p className="mt-2 text-[0.52rem] tracking-[0.08em] text-[#8A806D]">
										{item.label}
									</p>
								</div>

								{index < 3 && (
									<span className="mx-1 text-[1.55rem] leading-none text-[#A98445]/70">
										:
									</span>
								)}
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}