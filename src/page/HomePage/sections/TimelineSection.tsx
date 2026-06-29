export default function TimelineSection() {
	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-7 py-16 text-center text-[#5F5947]">
			<p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.32em] text-[#7C8B68]">
				Itinerario
			</p>

			<h2 className="mt-4 font-['Allura'] text-[3.8rem] leading-none text-[#6F7563]">
				Actividades
			</h2>

			<div className="mx-auto mt-8 max-w-[260px] space-y-4 text-left">
				{[
					['4:00 PM', 'Ceremonia religiosa'],
					['6:00 PM', 'Recepción'],
					['8:00 PM', 'Cena'],
				].map(([time, label]) => (
					<div key={time} className="flex items-center gap-4">
						<span className="font-['Cinzel'] text-[0.7rem] text-[#A98445]">
							{time}
						</span>
						<span className="h-px flex-1 bg-[#A98445]/25" />
						<span className="text-[0.78rem]">{label}</span>
					</div>
				))}
			</div>
		</section>
	);
}