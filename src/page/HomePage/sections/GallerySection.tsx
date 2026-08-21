import { Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import photo1 from '../../../assets/galery/Galeria1.jpg';
import photo2 from '../../../assets/galery/Galeria2.jpg';
import photo3 from '../../../assets/galery/Galeria3.jpg';
import photo4 from '../../../assets/galery/Galeria4.jpg';
import photo5 from '../../../assets/galery/Galeria5.jpg';
import photo6 from '../../../assets/galery/Galeria1.jpg';
import { GalleryLightbox } from '../components/GalleryLightbox';

const galleryImages = [photo1, photo2, photo3, photo4, photo5, photo6];

type GalleryImageButtonProps = {
	index: number;
	className: string;
	delay?: number;
	onOpen: (index: number) => void;
};

function GalleryImageButton({ index, className, delay = 0, onOpen }: GalleryImageButtonProps) {
	return (
		<motion.button
			type="button"
			className={`group relative block w-full cursor-zoom-in overflow-hidden border-[3px] border-white/90 bg-[#F2EBDD] shadow-[0_14px_32px_rgba(95,89,71,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98445] ${className}`}
			onClick={() => onOpen(index)}
			aria-label={`Abrir fotografía ${index + 1} de ${galleryImages.length}`}
			initial={{ opacity: 0, y: 26, scale: 0.97 }}
			whileInView={{ opacity: 1, y: 0, scale: 1 }}
			viewport={{ once: true, amount: 0.22 }}
			transition={{ duration: 0.75, ease: 'easeOut', delay }}
			whileTap={{ scale: 0.98 }}
		>
			<img
				src={galleryImages[index]}
				alt={index === 0 ? 'América y Carlos' : ''}
				className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
			/>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2E291D]/25 via-transparent to-transparent opacity-60 transition group-hover:opacity-90" />
			{index === 0 && (
				<span className="pointer-events-none absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-white/35 bg-[#2E291D]/30 text-white/90 shadow-sm backdrop-blur-md transition group-hover:scale-110 group-hover:bg-[#2E291D]/45">
					<Maximize2 size={14} strokeWidth={1.6} />
				</span>
			)}
		</motion.button>
	);
}

export function GallerySection() {
	const [selectedImage, setSelectedImage] = useState<number | null>(null);

	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-6 py-20 text-center text-[#5F5947]">
			<div className="mx-auto max-w-md">
				<motion.p
					className="font-['Cinzel'] text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#7C8B68]"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.7, ease: 'easeOut' }}
				>
					Nuestra historia
				</motion.p>

				<motion.h2
					className="mt-2 font-['Allura'] text-[3.35rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.75, ease: 'easeOut', delay: 0.08 }}
				>
					Nuestros momentos
				</motion.h2>

				<motion.div
					className="mx-auto mt-3 flex w-32 items-center gap-3 text-[#A98445]"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.8 }}
				>
					<motion.span
						className="h-px flex-1 origin-right bg-[#A98445]/45"
						variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
						transition={{ duration: 0.8, ease: 'easeOut', delay: 0.12 }}
					/>
					<motion.span
						className="text-xs"
						variants={{ hidden: { opacity: 0, scale: 0.4, rotate: -18 }, visible: { opacity: 1, scale: 1, rotate: 0 } }}
						transition={{ duration: 0.55, ease: 'easeOut', delay: 0.32 }}
					>
						♥
					</motion.span>
					<motion.span
						className="h-px flex-1 origin-left bg-[#A98445]/45"
						variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
						transition={{ duration: 0.8, ease: 'easeOut', delay: 0.12 }}
					/>
				</motion.div>

				<motion.p
					className="mx-auto mb-8 mt-4 max-w-[280px] text-[0.83rem] italic leading-6 text-[#6D6654]"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.75, ease: 'easeOut', delay: 0.18 }}
				>
					Un pedacito de nuestra historia antes de decir “sí, acepto”.
				</motion.p>

				<div className="space-y-3">
					<GalleryImageButton
						index={0}
						className="h-[360px] rounded-b-[1.75rem] rounded-t-[10rem]"
						onOpen={setSelectedImage}
					/>

					<div className="grid grid-cols-2 items-start gap-3">
						<GalleryImageButton index={1} className="h-52 rounded-[1.6rem]" delay={0.04} onOpen={setSelectedImage} />
						<GalleryImageButton index={2} className="mt-7 h-44 rounded-[1.6rem]" delay={0.1} onOpen={setSelectedImage} />
					</div>

					<GalleryImageButton index={3} className="h-52 rounded-[1.75rem]" delay={0.08} onOpen={setSelectedImage} />

					<div className="grid grid-cols-2 items-start gap-3">
						<GalleryImageButton index={4} className="mt-7 h-44 rounded-[1.6rem]" delay={0.06} onOpen={setSelectedImage} />
						<GalleryImageButton index={5} className="h-52 rounded-[1.6rem]" delay={0.12} onOpen={setSelectedImage} />
					</div>
				</div>

				<motion.p
					className="mt-7 inline-flex items-center gap-2 font-['Cinzel'] text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[#7C8B68]"
					initial={{ opacity: 0, y: 8 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.65 }}
				>
					<Maximize2 size={12} strokeWidth={1.5} /> Toca una foto para ampliarla
				</motion.p>
			</div>

			<GalleryLightbox images={galleryImages} initialIndex={selectedImage} onClose={() => setSelectedImage(null)} />
		</section>
	);
}
