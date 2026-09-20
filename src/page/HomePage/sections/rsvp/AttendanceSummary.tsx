import { Users } from 'lucide-react';

export function AttendanceSummary({ attending, total, unanswered }: { attending: number; total: number; unanswered: number }) {
	return <div className="rsvp-summary" role="status" aria-live="polite" aria-atomic="true">
		<p><Users size={15} aria-hidden="true" />{attending} de {total} {attending === 1 ? 'asistirá' : 'asistirán'}</p>
		{unanswered > 0 && <p className="rsvp-note">{unanswered === 1 ? 'Falta responder por 1 persona' : `Falta responder por ${unanswered} personas`}</p>}
	</div>;
}
