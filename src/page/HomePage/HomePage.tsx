import { CountdownSection } from './sections/CountdownSection';
import { DressCodeSection } from './sections/DressCodeSection';
import FooterSection from './sections/FooterSection';
import {GallerySection} from './sections/GallerySection';
import { GiftsSection } from './sections/GiftsSection';
import { HeroSection } from './sections/HeroSection';
import { RSVPSection } from './sections/RSVPSection';
import { StorySection } from './sections/StorySection';
import TimelineSection from './sections/TimelineSection';
import { LocationSection } from './sections/LocationSection';

export function HomePage() {
	return (
		<main className="min-h-dvh bg-white text-[#5F5947]">
			<div className="mx-auto w-full max-w-[390px] overflow-hidden bg-[#FAF8F3] shadow-[0_24px_70px_rgba(95,89,71,0.12)]">
				<HeroSection />
				<StorySection />
				<CountdownSection />
				<GallerySection />
				<LocationSection />
				<TimelineSection />
				<DressCodeSection />
				<GiftsSection />
				<RSVPSection />
				<FooterSection />
			</div>
		</main>
	);
}

//#FAF8F3 posible color del contenedor de la pagina
// mededida de los lados max-w-[390px] 		