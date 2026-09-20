import { useEffect, useRef, useState } from 'react';
import { isValidGuestName } from './rsvpDraft';
import { RSVPAlert } from './RSVPAlert';

export function GuestNameEditor({ id, value, isReplacement = false, invalid, onChange, onDone }: {
	id: string;
	value: string;
	isReplacement?: boolean;
	invalid: boolean;
	onChange: (value: string) => void;
	onDone: () => void;
}) {
	const input = useRef<HTMLInputElement>(null);
	// Keep live draft updates; Cancel restores only this editor's opening value.
	const openingValue = useRef(value);
	const [attempted, setAttempted] = useState(false);
	const nameError = Boolean(value.trim()) && !isValidGuestName(value);
	const showError = invalid || (attempted && nameError);
	useEffect(() => { input.current?.focus({ preventScroll: true }); }, []);
	return <div className="rsvp-editor-content">
		<label htmlFor={`${id}-input`}>
			{isReplacement ? (openingValue.current.trim() ? 'Editar reemplazo' : 'Nombre del reemplazo') : 'Nombre del acompañante'}
		</label>
		<div className="rsvp-editor-fields">
			<input ref={input} id={`${id}-input`} type="text" value={value} maxLength={100}
				autoComplete="off" aria-invalid={showError || undefined}
				aria-describedby={[!isReplacement && `${id}-hint`, showError && `${id}-name-error`].filter(Boolean).join(' ') || undefined}
				onChange={event => onChange(event.target.value)} />
			<button type="button" className="rsvp-action" onClick={() => {
				setAttempted(true);
				if (nameError) input.current?.focus();
				else onDone();
			}}>Listo</button>
			{isReplacement && <button type="button" className="rsvp-action" onClick={() => {
				onChange(openingValue.current);
				onDone();
			}}>Cancelar</button>}
		</div>
		{!isReplacement && <p id={`${id}-hint`} className="rsvp-note">Al agregar su nombre, este lugar contará como asistencia.</p>}
		{showError && <RSVPAlert id={`${id}-name-error`} title="Revisa el nombre">
			<p>Escribe un nombre de al menos 2 caracteres.</p>
		</RSVPAlert>}
	</div>;
}
