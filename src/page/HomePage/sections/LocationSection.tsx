import { Player } from '@lottiefiles/react-lottie-player';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock3, Copy, MapPin, Navigation, Route, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import celebrationAnimation from '../../../assets/animations/celebration.json';
import churchAnimation from '../../../assets/animations/Church.json';

type LocationDetails = {
	type: string;
	name: string;
	address: string;
	mapsUrl: string;
	wazeUrl: string;
};

type DirectionsSheetProps = {
	location: LocationDetails | null;
	onClose: () => void;
};

function DirectionsSheet({ location, onClose }: DirectionsSheetProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!location) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [location, onClose]);

	useEffect(() => setCopied(false), [location]);

	if (typeof document === 'undefined') return null;

	const copyAddress = async () => {
		if (!location) return;
		await navigator.clipboard.writeText(`${location.name}, ${location.address}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	};

	return createPortal(
		<AnimatePresence>
			{location && (
				<motion.div
					className="fixed inset-0 z-[110] flex items-end justify-center bg-[#242117]/60 px-3 backdrop-blur-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					role="dialog"
					aria-modal="true"
					aria-label={`Cómo llegar a ${location.name}`}
				>
					<motion.div
						className="relative mb-[max(0.75rem,env(safe-area-inset-bottom))] w-full max-w-sm rounded-[2rem] border border-[#D7C7A8] bg-[#FFFDF8] p-6 text-center shadow-2xl"
						initial={{ y: 80, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 80, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 280, damping: 28 }}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#A98445]/25" />
						<button
							type="button"
							className="absolute right-6 top-6 grid h-9 w-9 place-items-center rounded-full bg-[#F2EBDD] text-[#6D6654]"
							onClick={onClose}
							aria-label="Cerrar opciones de navegación"
						>
							<X size={18} />
						</button>

						<p className="mt-4 font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#7C8B68]">
							{location.type}
						</p>
						<h3 className="mt-2 font-['Allura'] text-[2.4rem] leading-none text-[#A98445]">
							{location.name}
						</h3>
						<p className="mx-auto mt-3 max-w-[250px] text-sm italic leading-6 text-[#6D6654]">
							{location.address}
						</p>

						<div className="mt-6 grid grid-cols-2 gap-3">
							<a href={location.mapsUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-[#D9D0BF] bg-[#F7F3EA] px-3 py-4 text-[#6D6654] transition hover:border-[#A98445]/55 hover:bg-[#F2EBDD] active:scale-[0.98]">
								<MapPin className="mx-auto mb-2" size={21} strokeWidth={1.5} />
								<span className="block font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.1em]">Google Maps</span>
								<span className="mt-1 block text-[0.58rem] text-[#7C8B68]">Abrir mapa</span>
							</a>
							<a href={location.wazeUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-[#D9D0BF] bg-[#F7F3EA] px-3 py-4 text-[#6D6654] transition hover:border-[#A98445]/55 hover:bg-[#F2EBDD] active:scale-[0.98]">
								<Navigation className="mx-auto mb-2" size={21} strokeWidth={1.5} />
								<span className="block font-['Cinzel'] text-[0.62rem] font-semibold uppercase tracking-[0.1em]">Waze</span>
								<span className="mt-1 block text-[0.58rem] text-[#7C8B68]">Iniciar ruta</span>
							</a>
						</div>

						<button
							type="button"
							className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#7C8B68] px-5 py-3.5 font-['Cinzel'] text-[0.63rem] font-semibold uppercase tracking-[0.14em] text-white transition active:scale-[0.98]"
							onClick={copyAddress}
						>
							{copied ? <Check size={16} /> : <Copy size={15} />}
							{copied ? 'Dirección copiada' : 'Copiar dirección'}
						</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}

export function LocationSection() {
	const churchRef = useRef<Player>(null);
	const celebrationRef = useRef<Player>(null);
	const [hasPlayedChurch, setHasPlayedChurch] = useState(false);
	const [hasPlayedCelebration, setHasPlayedCelebration] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
	const [touchedAnimations, setTouchedAnimations] = useState<Record<string, boolean>>({});

	const locations = [
		{
			type: 'Ceremonia religiosa',
			name: 'Iglesia San Pedro',
			address: 'Calle Tarija y Av. América',
			mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Palacio+de+Bellas+Artes+Ciudad+de+Mexico',
			wazeUrl: 'https://www.waze.com/ul?q=Palacio%20de%20Bellas%20Artes%20Ciudad%20de%20Mexico&navigate=yes',
			animation: churchAnimation,
			playerRef: churchRef,
			hasPlayed: hasPlayedChurch,
			markPlayed: setHasPlayedChurch,
		},
		{
			type: 'Celebración',
			name: 'Jardín Padilla',
			address: 'Calle Sucre y 16 de Julio',
			mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Palacio+de+Bellas+Artes+Ciudad+de+Mexico',
			wazeUrl: 'https://www.waze.com/ul?q=Palacio%20de%20Bellas%20Artes%20Ciudad%20de%20Mexico&navigate=yes',
			animation: celebrationAnimation,
			playerRef: celebrationRef,
			hasPlayed: hasPlayedCelebration,
			markPlayed: setHasPlayedCelebration,
		},
	];

	return (
		<section className="relative flex min-h-svh items-center overflow-hidden bg-[#FAF8F3] px-6 py-8 text-center text-[#5F5947]">
			<div className="relative z-10 mx-auto w-full max-w-[340px]">
				<motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
					<h2 className="font-['Allura'] text-[3.2rem] leading-none text-[#A98445]">Nuestros lugares</h2>
				</motion.div>

				<div className="relative mt-5 space-y-6">
					<div className="absolute bottom-[42%] left-1/2 top-[42%] w-px -translate-x-1/2 border-l border-dashed border-[#A98445]/45" />
					<div className="absolute left-1/2 top-1/2 z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#D7C7A8] bg-[#FAF8F3] text-[#A98445] shadow-sm">
						<Route size={17} strokeWidth={1.5} />
					</div>

					{locations.map((location, index) => {
						const playAnimation = () => {
							location.playerRef.current?.stop();
							location.playerRef.current?.play();
						};
						const replayAnimation = () => {
							playAnimation();
							setTouchedAnimations((current) => ({ ...current, [location.name]: true }));
						};
						return (
							<motion.article key={location.name}
								className="relative rounded-[2rem] border border-[#D9CEB9]/80 bg-[#FFFDF8]/95 px-6 pb-5 pt-3 shadow-[0_18px_50px_rgba(95,89,71,0.03)] backdrop-blur-sm"
								initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.12, duration: 0.75 }}
								onViewportEnter={() => {
									if (!location.hasPlayed) { location.markPlayed(true); playAnimation(); }
								}}
							>
								<motion.button
									type="button"
									onClick={replayAnimation}
									aria-label={`Reproducir nuevamente la animación de ${location.type}`}
									className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98445]"
									animate={touchedAnimations[location.name] ? undefined : { scale: [1, 1.05, 1] }}
									transition={{ duration: 1.8, repeat: 2, ease: 'easeInOut' }}
									whileTap={{ scale: 0.92 }}
								>
									{!touchedAnimations[location.name] && (
										<motion.span
											className="pointer-events-none absolute inset-1 rounded-full border border-[#A98445]/55"
											initial={{ opacity: 0.65, scale: 0.85 }}
											animate={{ opacity: 0, scale: 1.35 }}
											transition={{ duration: 1.6, repeat: 2, ease: 'easeOut' }}
										/>
									)}
									<Player ref={location.playerRef} autoplay={false} loop={false} keepLastFrame src={location.animation} className="relative z-10 h-14 w-14" />
								</motion.button>
								<AnimatePresence initial={false}>
									{!touchedAnimations[location.name] && (
										<motion.p
											className="-mt-1 mb-1 flex items-center justify-center gap-1 font-['Cinzel'] text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-[#A98445]"
											initial={{ opacity: 0, y: -3 }}
											animate={{ opacity: 0.85, y: 0 }}
											exit={{ opacity: 0, height: 0, margin: 0 }}
										>
											<Sparkles size={10} strokeWidth={1.7} /> Toca para animar
										</motion.p>
									)}
								</AnimatePresence>
								<p className="mt-1 font-['Cinzel'] text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#6F7563]">{location.type}</p>
								<h3 className="mt-2 font-['Allura'] text-[2.7rem] leading-none text-[#A98445]">{location.name}</h3>

								<div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-[#F3EDE2] px-4 py-2 text-[0.65rem] text-[#6D6654]">
									<Clock3 size={14} className="text-[#7C8B68]" />
									<span className="font-['Cinzel'] uppercase tracking-[0.1em]">Horario por confirmar</span>
								</div>

								<div className="mt-3 flex items-start justify-center gap-2 text-[0.8rem] italic leading-6 text-[#5F5947]">
									<MapPin size={15} strokeWidth={1.7} className="mt-1 shrink-0 text-[#7C8B68]" />
									<span>{location.address}</span>
								</div>

								<button type="button"
									className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#7C8B68] px-7 py-3 font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#FFF8EC] shadow-[0_12px_28px_rgba(95,89,71,0.18)] transition active:scale-95"
									onClick={() => setSelectedLocation(location)}>
									<Navigation size={14} strokeWidth={1.7} /> Cómo llegar
								</button>
							</motion.article>
						);
					})}
				</div>
			</div>

			<DirectionsSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
		</section>
	);
}
