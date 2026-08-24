import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type GalleryLightboxProps = { images: string[]; initialIndex: number | null; onClose: () => void };

const swipeThreshold = 70;
const controlsDelay = 3200;

const imageVariants = {
	enter: (direction: number) => ({ opacity: 0, x: direction * 90 }),
	center: { opacity: 1, x: 0 },
	exit: (direction: number) => ({ opacity: 0, x: direction * -90 }),
};

export function GalleryLightbox({ images, initialIndex, onClose }: GalleryLightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
	const [direction, setDirection] = useState(1);
	const [controlsVisible, setControlsVisible] = useState(true);
	const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const touchStartX = useRef<number | null>(null);
	const touchMoved = useRef(false);
	const isOpen = initialIndex !== null;

	const revealControls = useCallback(() => {
		setControlsVisible(true);
		if (controlsTimer.current) clearTimeout(controlsTimer.current);
		controlsTimer.current = setTimeout(() => setControlsVisible(false), controlsDelay);
	}, []);

	const goTo = useCallback((index: number, nextDirection: number) => {
		setDirection(nextDirection);
		setCurrentIndex((index + images.length) % images.length);
	}, [images.length]);

	const showPrevious = useCallback(() => goTo(currentIndex - 1, -1), [currentIndex, goTo]);
	const showNext = useCallback(() => goTo(currentIndex + 1, 1), [currentIndex, goTo]);

	useEffect(() => {
		if (initialIndex !== null) {
			setCurrentIndex(initialIndex);
			revealControls();
		}
	}, [initialIndex, revealControls]);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
			if (event.key === 'ArrowLeft') showPrevious();
			if (event.key === 'ArrowRight') showNext();
			revealControls();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeyDown);
			if (controlsTimer.current) clearTimeout(controlsTimer.current);
		};
	}, [isOpen, onClose, revealControls, showNext, showPrevious]);

	if (typeof document === 'undefined') return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#17150f] px-4 pb-32 pt-16"
					initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
					transition={{ duration: 0.28 }} onClick={onClose} onMouseMove={revealControls}
					role="dialog" aria-modal="true" aria-label="Galería de fotografías"
				>
					<AnimatePresence mode="popLayout">
						<motion.div key={`background-${currentIndex}`} className="pointer-events-none absolute inset-[-30px] bg-cover bg-center"
							style={{ backgroundImage: `url(${images[currentIndex]})` }} initial={{ opacity: 0 }}
							animate={{ opacity: 0.38 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} />
					</AnimatePresence>
					<div className="pointer-events-none absolute inset-0 bg-[#17150f]/65 backdrop-blur-2xl" />

					<motion.button type="button"
						className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 grid h-11 w-11 place-items-center rounded-full border border-[#D5B877]/55 bg-black/25 text-white backdrop-blur-md focus-visible:outline-2 focus-visible:outline-[#D5B877]"
						animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : -8 }}
						style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }} onClick={onClose} aria-label="Cerrar galería">
						<X size={24} strokeWidth={1.5} />
					</motion.button>

					{[
						{ side: 'left-3', label: 'Fotografía anterior', icon: ChevronLeft, action: showPrevious },
						{ side: 'right-3', label: 'Siguiente fotografía', icon: ChevronRight, action: showNext },
					].map(({ side, label, icon: Icon, action }) => (
						<motion.button key={label} type="button"
							className={`absolute ${side} top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/25 text-white/90 backdrop-blur-md focus-visible:outline-2 focus-visible:outline-[#D5B877]`}
							animate={{ opacity: controlsVisible ? 1 : 0 }} style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
							onClick={(event) => { event.stopPropagation(); action(); revealControls(); }} aria-label={label}>
							<Icon size={28} strokeWidth={1.4} />
						</motion.button>
					))}

					<div className="relative z-10 flex h-full w-full max-w-5xl touch-pan-y items-center justify-center overflow-hidden"
						onClick={(event) => { event.stopPropagation(); revealControls(); }}>
						<AnimatePresence custom={direction} initial={false} mode="popLayout">
							<motion.img key={currentIndex} custom={direction} src={images[currentIndex]}
								alt={`Fotografía ${currentIndex + 1} de ${images.length}`}
								className="max-h-full max-w-full select-none object-contain drop-shadow-2xl"
								variants={imageVariants} initial="enter" animate="center" exit="exit"
								transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
								onTouchStart={(event) => {
									if (event.touches.length === 1) {
										touchStartX.current = event.touches[0].clientX;
										touchMoved.current = false;
									}
								}}
								onTouchMove={(event) => {
									if (event.touches.length === 1 && touchStartX.current !== null) {
										touchMoved.current = Math.abs(event.touches[0].clientX - touchStartX.current) > 10;
									}
								}}
								onTouchEnd={(event) => {
									if (event.touches.length !== 0) return;
									if (touchMoved.current && touchStartX.current !== null) {
										const offset = event.changedTouches[0].clientX - touchStartX.current;
										touchStartX.current = null;
										if (offset < -swipeThreshold) showNext();
										if (offset > swipeThreshold) showPrevious();
										return;
									}
									touchStartX.current = null;
								}}
								draggable={false} />
						</AnimatePresence>
					</div>

					<motion.div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 z-20"
						animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : 12 }}
						style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }} onClick={(event) => event.stopPropagation()}>
						<p className="mb-3 text-center font-['Cinzel'] text-[0.65rem] tracking-[0.2em] text-white/80">{currentIndex + 1} / {images.length}</p>
						<div className="mx-auto flex max-w-full justify-center gap-2 overflow-x-auto px-4 pb-1">
							{images.map((image, index) => (
								<button key={`${image}-${index}`} type="button"
									className={`h-14 w-11 shrink-0 overflow-hidden rounded-lg border-2 transition ${index === currentIndex ? 'border-[#D5B877] opacity-100 shadow-[0_0_16px_rgba(213,184,119,0.35)]' : 'border-transparent opacity-55 hover:opacity-90'}`}
									onClick={() => { goTo(index, index >= currentIndex ? 1 : -1); revealControls(); }} aria-label={`Ver fotografía ${index + 1}`}>
									<img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
								</button>
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>, document.body,
	);
}
