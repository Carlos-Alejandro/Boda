export default function GallerySection() {
	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-7 py-16 text-center text-[#5F5947]">
			<p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.32em] text-[#7C8B68]">
				Galería
			</p>

			<h2 className="mt-4 font-['Allura'] text-[3.8rem] leading-none text-[#6F7563]">
				Momentos
			</h2>

			<div className="mt-8 grid grid-cols-2 gap-3">
				<div className="h-40 rounded-t-full bg-[#E8E4DA]" />
				<div className="h-40 rounded-t-full bg-[#E8E4DA]" />
				<div className="h-32 bg-[#E8E4DA]" />
				<div className="h-32 bg-[#E8E4DA]" />
			</div>
		</section>
	);
}