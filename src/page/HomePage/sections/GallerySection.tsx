import { motion } from 'motion/react';

import photo1 from '../../../assets/galery/Galeria1.jpg';
import photo2 from '../../../assets/galery/Galeria2.jpg';
import photo3 from '../../../assets/galery/Galeria3.jpg';
import photo4 from '../../../assets/galery/Galeria4.jpg';
import photo5 from '../../../assets/galery/Galeria5.jpg';
import photo6 from '../../../assets/galery/Galeria1.jpg';

const photos = [photo2, photo3, photo5, photo6];

const imageAnimation = {
	initial: { opacity: 0, y: 24, scale: 0.97 },
	whileInView: { opacity: 1, y: 0, scale: 1 },
	viewport: { once: true, amount: 0.25 },
};

export function GallerySection() {
	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-6 py-20 text-center text-[#5F5947]">
			<div className="mx-auto max-w-md">
				<motion.div
					className="mb-4 flex items-center justify-center gap-4 text-[#A98445]"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.4 }}
				>
					<motion.span
						className="h-[2px] w-24 origin-right rounded-full bg-[#A98445]/55"
						variants={{
							hidden: { opacity: 0, scaleX: 0 },
							visible: { opacity: 1, scaleX: 1 },
						}}
						transition={{ duration: 0.8, ease: 'easeOut' }}
					/>

					<motion.span
						className="font-['Allura'] text-[1.25rem] leading-none text-[#A98445]"
						variants={{
							hidden: { opacity: 0, scale: 0.6, rotate: -8 },
							visible: { opacity: 1, scale: 1, rotate: 0 },
						}}
						transition={{ delay: 0.25, duration: 0.65, ease: 'easeOut' }}
					>
						♥
					</motion.span>

					<motion.span
						className="h-[2px] w-24 origin-left rounded-full bg-[#A98445]/55"
						variants={{
							hidden: { opacity: 0, scaleX: 0 },
							visible: { opacity: 1, scaleX: 1 },
						}}
						transition={{ duration: 0.8, ease: 'easeOut' }}
					/>
				</motion.div>

				<motion.p
					className="font-['Cinzel'] text-[1rem] font-semibold uppercase tracking-[0.34em] text-[#A98445]"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
				>
					Nuestros momentos
				</motion.p>

				<motion.p
					className="mx-auto mb-8 mt-4 max-w-[275px] font-['Cinzel'] text-[0.68rem] font-medium uppercase leading-[1.9] tracking-[0.11em] text-[#6D6654]"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.8, ease: 'easeOut', delay: 0.18 }}
				>
					Un pedacito de nuestra historia
					<br />
					antes de decir “sí, acepto”.
				</motion.p>

				<div className="space-y-4">
					<motion.img
						src={photo1}
						alt="América y Carlos"
						className="h-[360px] w-full rounded-t-full object-cover shadow-lg"
						{...imageAnimation}
						transition={{ duration: 0.9, ease: 'easeOut' }}
					/>

					<div className="grid grid-cols-2 gap-4">
						{photos.slice(0, 2).map((photo, index) => (
							<motion.img
								key={`${photo}-${index}`}
								src={photo}
								alt=""
								className="h-48 w-full rounded-3xl object-cover shadow-md"
								{...imageAnimation}
								transition={{
									duration: 0.8,
									ease: 'easeOut',
									delay: index * 0.08,
								}}
							/>
						))}
					</div>

					<motion.img
						src={photo4}
						alt=""
						className="h-56 w-full rounded-3xl object-cover shadow-md"
						{...imageAnimation}
						transition={{ duration: 0.8, ease: 'easeOut', delay: 0.12 }}
					/>

					<div className="grid grid-cols-2 gap-4">
						{photos.slice(2).map((photo, index) => (
							<motion.img
								key={`${photo}-${index + 2}`}
								src={photo}
								alt=""
								className="h-56 w-full rounded-3xl object-cover shadow-md"
								{...imageAnimation}
								transition={{
									duration: 0.8,
									ease: 'easeOut',
									delay: 0.16 + index * 0.08,
								}}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}