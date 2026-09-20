import { Check, X } from 'lucide-react';
import type { AttendanceResponse } from '../rsvpLogic';

export function AttendanceToggle({ id, response, invalid, onSelect }: {
	id: string;
	response: AttendanceResponse;
	invalid: boolean;
	onSelect: (value: boolean) => void;
}) {
	return <div className="rsvp-toggle" role="group" aria-labelledby={`${id}-name`}
		aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined}>
		{([true, false] as const).map(value => <button key={String(value)} type="button"
			id={value ? `${id}-answer` : undefined} aria-pressed={response === value}
			onClick={() => onSelect(value)}>
			<span className="rsvp-selection" aria-hidden="true">
				{response === value && (value ? <Check size={11} strokeWidth={2.5} /> : <X size={11} strokeWidth={2.5} />)}
			</span>
			<span>{value ? 'Sí' : 'No'}</span>
			<span aria-hidden="true" />
		</button>)}
	</div>;
}
