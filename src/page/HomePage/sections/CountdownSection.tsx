import { useEffect, useState } from 'react';

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

const weddingDate = new Date('2028-03-18T00:00:00');

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

	const timeItems = [
		{ label: 'Días', value: timeLeft.days },
		{ label: 'Horas', value: timeLeft.hours },
		{ label: 'Min', value: timeLeft.minutes },
		{ label: 'Seg', value: timeLeft.seconds },
	];

	return (
		<section className="relative overflow-hidden bg-[#FAF8F3] px-7 py-16 text-center text-[#5F5947]">
			<p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.34em] text-[#7C8B68]">
				Faltan
			</p>

			<div className="mt-8 grid grid-cols-4 gap-3">
				{timeItems.map((item) => (
					<div key={item.label} className="text-center">
						<p className="font-['Cinzel'] text-2xl text-[#6F7563]">
							{String(item.value).padStart(2, '0')}
						</p>

						<p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-[#A98445]">
							{item.label}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}