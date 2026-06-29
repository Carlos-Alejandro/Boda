export function RSVPSection() {
	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-7 py-16 text-center text-[#5F5947]">
			<p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.32em] text-[#7C8B68]">
				Confirmar asistencia
			</p>

			<h2 className="mt-4 font-['Allura'] text-[3.8rem] leading-none text-[#6F7563]">
				RSVP
			</h2>

			<button
				type="button"
				className="mt-8 rounded-full bg-[#7C8B68] px-8 py-3 font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(95,89,71,0.16)]"
			>
				Confirmar aquí
			</button>
		</section>
	);
}