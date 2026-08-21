import { AnimatePresence, motion } from 'motion/react';
import { Copy, Gift, Heart, Landmark, Mail, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type GiftOption = 'envelope' | 'transfer' | 'registry';

const giftOptions = {
	envelope: { title: 'Lluvia de sobres', subtitle: 'Un detalle el día de la boda', icon: Mail },
	transfer: { title: 'Transferencia', subtitle: 'Datos bancarios', icon: Landmark },
	registry: { title: 'Mesa de regalos', subtitle: 'Elige un detalle especial', icon: Gift },
} as const;

type GiftOptionsSheetProps = {
	option: GiftOption | null;
	onClose: () => void;
};

function GiftOptionsSheet({ option, onClose }: GiftOptionsSheetProps) {
	useEffect(() => {
		if (!option) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose, option]);

	if (typeof document === 'undefined') return null;

	return createPortal(
		<AnimatePresence>
			{option && (
				<motion.div
					className="fixed inset-0 z-[110] flex items-end justify-center bg-[#242117]/60 px-3 backdrop-blur-sm"
					initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
					onClick={onClose} role="dialog" aria-modal="true" aria-label={giftOptions[option].title}
				>
					<motion.div
						className="relative mb-[max(0.75rem,env(safe-area-inset-bottom))] w-full max-w-sm rounded-[2rem] border border-[#D7C7A8] bg-[#FFFDF8] px-6 pb-7 pt-6 text-center shadow-2xl"
						initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }}
						transition={{ type: 'spring', stiffness: 280, damping: 28 }} onClick={(event) => event.stopPropagation()}
					>
						<div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[#A98445]/25" />
						<button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[#F2EBDD] text-[#6D6654]" aria-label="Cerrar opciones de regalo">
							<X size={18} />
						</button>

						<motion.div className="mx-auto mt-4 grid h-14 w-14 place-items-center rounded-full border border-[#A98445]/35 bg-[#F7F3EA] text-[#A98445]"
							initial={{ scale: 0.75, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}>
							{(() => { const Icon = giftOptions[option].icon; return <Icon size={25} strokeWidth={1.4} />; })()}
						</motion.div>
						<p className="mt-4 font-['Cinzel'] text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#7C8B68]">Sugerencia de regalo</p>
						<h3 className="mt-2 font-['Allura'] text-[2.7rem] leading-none text-[#A98445]">{giftOptions[option].title}</h3>

						{option === 'envelope' && (
							<p className="mx-auto mt-5 max-w-[275px] text-[0.85rem] leading-6 text-[#5F5947]">
								Si deseas obsequiarnos un detalle, tendremos un espacio especial para recibir sobres durante la celebración.
							</p>
						)}

						{option === 'transfer' && (
							<div className="mt-5 space-y-3 text-left">
								{['Banco', 'Titular', 'Cuenta / CLABE'].map((label) => (
									<div key={label} className="flex items-center justify-between border-b border-[#D9CEB9] py-2.5">
										<div>
											<p className="font-['Cinzel'] text-[0.52rem] font-semibold uppercase tracking-[0.14em] text-[#8A806D]">{label}</p>
											<p className="mt-1 text-[0.8rem] italic text-[#6D6654]">Por confirmar</p>
										</div>
										<Copy size={15} className="text-[#A98445]/35" aria-hidden="true" />
									</div>
								))}
								<p className="pt-1 text-center text-[0.68rem] italic text-[#8A806D]">Agregaremos los datos bancarios próximamente.</p>
							</div>
						)}

						{option === 'registry' && (
							<div className="mt-5">
								<p className="mx-auto max-w-[270px] text-[0.85rem] leading-6 text-[#5F5947]">Muy pronto podrás consultar nuestra mesa de regalos.</p>
								<button type="button" disabled className="mt-5 rounded-full border border-[#A98445]/30 px-7 py-3 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-[#A98445]/55">Enlace por confirmar</button>
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}

export function GiftSuggestionSection() {
	const [selectedOption, setSelectedOption] = useState<GiftOption | null>(null);
	const [envelopeOpened, setEnvelopeOpened] = useState(false);

	const openOption = (option: GiftOption) => {
		setEnvelopeOpened(true);
		setTimeout(() => setSelectedOption(option), 260);
	};

	return (
		<section className="relative flex min-h-svh items-center overflow-hidden bg-[#FAF8F3] px-6 py-16 text-center text-[#5F5947]">
			<div className="mx-auto w-full max-w-[350px]">
				<motion.p className="font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#7C8B68]"
					initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
					Un detalle con amor
				</motion.p>
				<motion.h2 className="mt-2 font-['Allura'] text-[3.8rem] leading-none text-[#A98445]"
					initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08, duration: 0.8 }}>
					Con cariño
				</motion.h2>
				<motion.p className="mx-auto mt-5 max-w-[285px] text-[0.86rem] leading-6"
					initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16, duration: 0.75 }}>
					Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle, hemos preparado algunas opciones.
				</motion.p>

				<motion.button type="button" onClick={() => openOption('envelope')}
					className="group relative mx-auto mt-10 block h-36 w-48 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#A98445]"
					initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22, duration: 0.8 }} aria-label="Abrir opciones de regalo">
					<motion.span className="absolute inset-x-2 bottom-1 h-28 rounded-b-2xl border border-[#B99A5C]/55 bg-[#EFE3CC] shadow-[0_18px_35px_rgba(95,89,71,0.14)]"
						animate={{ y: envelopeOpened ? 3 : [0, -3, 0] }} transition={{ duration: 2.2, repeat: envelopeOpened ? 0 : Infinity }} />
					<motion.span className="absolute left-2 right-2 top-7 h-24 origin-top bg-[#E4D3B5] [clip-path:polygon(0_0,50%_62%,100%_0)]"
						animate={{ rotateX: envelopeOpened ? 165 : 0 }} transition={{ duration: 0.45, ease: 'easeInOut' }} />
					<span className="absolute inset-x-2 bottom-1 h-28 rounded-b-2xl bg-[#F4E9D5] [clip-path:polygon(0_0,50%_48%,100%_0,100%_100%,0_100%)]" />
					<motion.span className="absolute left-1/2 top-[4.6rem] z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-[#A98445] text-[#FFF8EC] shadow-lg"
						whileTap={{ scale: 0.9 }} animate={{ scale: envelopeOpened ? 0.9 : [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: envelopeOpened ? 0 : Infinity }}>
						<Heart size={18} fill="currentColor" strokeWidth={1.3} />
					</motion.span>
					{!envelopeOpened && [0, 1, 2].map((spark) => (
						<motion.span key={spark} className="absolute text-[#A98445]" style={{ left: `${28 + spark * 25}%`, top: `${spark % 2 ? 0 : 12}%` }}
							animate={{ opacity: [0, 0.8, 0], y: [4, -8, -14], scale: [0.7, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity, delay: spark * 0.45 }}>
							<Sparkles size={12} />
						</motion.span>
					))}
				</motion.button>

				<motion.p className="mt-4 font-['Cinzel'] text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#A98445]"
					initial={{ opacity: 0 }} whileInView={{ opacity: 0.85 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
					Toca el sobre para descubrir
				</motion.p>

				<motion.div className="mt-9 flex items-start justify-between" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.35, duration: 0.75 }}>
					{(Object.entries(giftOptions) as [GiftOption, (typeof giftOptions)[GiftOption]][]).map(([key, option]) => {
						const Icon = option.icon;
						return (
							<button key={key} type="button" onClick={() => openOption(key)} className="group flex w-[31%] flex-col items-center transition active:scale-95">
								<span className="grid h-11 w-11 place-items-center rounded-full border border-[#A98445]/35 text-[#7C8B68] transition group-hover:bg-[#F2EBDD]"><Icon size={19} strokeWidth={1.4} /></span>
								<span className="mt-3 font-['Cinzel'] text-[0.5rem] font-semibold uppercase leading-4 tracking-[0.1em]">{option.title}</span>
							</button>
						);
					})}
				</motion.div>

				<motion.div className="mx-auto mt-9 flex w-36 items-center gap-3 text-[#A98445]" initial="hidden" whileInView="visible" viewport={{ once: true }}>
					<motion.span className="h-px flex-1 origin-right bg-[#A98445]/40" variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }} transition={{ duration: 0.7 }} />
					<motion.span className="text-xs" variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }} transition={{ delay: 0.25 }}>♥</motion.span>
					<motion.span className="h-px flex-1 origin-left bg-[#A98445]/40" variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }} transition={{ duration: 0.7 }} />
				</motion.div>
			</div>

			<GiftOptionsSheet option={selectedOption} onClose={() => { setSelectedOption(null); setEnvelopeOpened(false); }} />
		</section>
	);
}
