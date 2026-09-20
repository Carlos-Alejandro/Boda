import { useLayoutEffect, useRef } from 'react';

export function RSVPMessage({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
	const textarea = useRef<HTMLTextAreaElement>(null);
	useLayoutEffect(() => {
		if (!textarea.current) return;
		textarea.current.style.height = 'auto';
		textarea.current.style.height = `${textarea.current.scrollHeight + 2}px`;
	}, [value]);
	return <div className="rsvp-message">
		<label htmlFor={id}>Déjanos un mensaje <span>Opcional</span></label>
		<textarea ref={textarea} id={id} value={value} onChange={event => onChange(event.target.value)}
			maxLength={500} rows={2} placeholder="Escribe aquí tus buenos deseos..." />
	</div>;
}
