import type { ReactNode } from 'react';

import './DeviceGate.css';

interface DeviceGateProps {
	children: ReactNode;
}

export function DeviceGate({ children }: DeviceGateProps) {
	return (
		<>
			<main className="device-gate-mobile">
				{children}
			</main>

			<section className="device-gate-desktop">
				<div className="device-gate-card">
					<p>Invitación digital</p>

					<h1>Diseñada para celular o tablet</h1>

					<span>
						Para vivir mejor la experiencia, abre esta página desde tu teléfono
						o tablet.
					</span>
				</div>
			</section>
		</>
	);
}