import { TriangleAlert } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

/** Presentation only: persistent feedback, with optional focus after a failed save. */
export function RSVPAlert({ id, title, children, focusOnMount = false, urgent = true }: {
	id?: string;
	title: string;
	children: ReactNode;
	focusOnMount?: boolean;
	urgent?: boolean;
}) {
	const generatedId = useId();
	const alertId = id ?? generatedId;
	const alert = useRef<HTMLDivElement>(null);
	useEffect(() => {
		// Native focus brings an off-screen alert into view without a separate scroll animation.
		if (focusOnMount) alert.current?.focus();
	}, [focusOnMount]);
	return <div ref={alert} id={alertId} className="rsvp-alert" role={urgent ? 'alert' : 'status'}
		tabIndex={-1} aria-labelledby={`${alertId}-title`} aria-describedby={`${alertId}-body`}>
		<div className="rsvp-alert-title" id={`${alertId}-title`}>
			<TriangleAlert size={18} aria-hidden="true" /><strong>{title}</strong>
		</div>
		<div className="rsvp-alert-body" id={`${alertId}-body`}>{children}</div>
	</div>;
}
