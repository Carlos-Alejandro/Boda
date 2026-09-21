import { useEffect, useRef, useState } from 'react';
import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import { editorScrollCorrection } from './editorViewport';
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
	const present = useIsPresent();
	const reducedMotion = useReducedMotion();
	const [ready, setReady] = useState(false);
	// Keep live draft updates; Cancel restores only this editor's opening value.
	const openingValue = useRef(value);
	const [attempted, setAttempted] = useState(false);
	const nameError = Boolean(value.trim()) && !isValidGuestName(value);
	const showError = invalid || (attempted && nameError);
	useEffect(() => {
		if (!ready || !present) return;
		const field = input.current;
		if (!field) return;
		const viewport = window.visualViewport;
		let frame = 0;
		const check = () => {
			frame = 0;
			if (document.activeElement !== field) return;
			const delta = editorScrollCorrection(field.getBoundingClientRect().bottom, window.innerHeight, viewport);
			// Instant correction avoids competing with the global smooth-scroll CSS.
			if (delta > 0) window.scrollBy({ top: delta, behavior: 'instant' });
		};
		const schedule = () => {
			cancelAnimationFrame(frame);
			// Let native focus/viewport scrolling settle before measuring again.
			frame = requestAnimationFrame(() => { frame = requestAnimationFrame(check); });
		};
		viewport?.addEventListener('resize', schedule);
		viewport?.addEventListener('scroll', schedule);
		window.addEventListener('resize', schedule);
		field.addEventListener('focus', schedule);
		frame = requestAnimationFrame(() => {
			field.focus();
			schedule();
		});
		return () => {
			cancelAnimationFrame(frame);
			viewport?.removeEventListener('resize', schedule);
			viewport?.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			field.removeEventListener('focus', schedule);
		};
	}, [ready, present]);
	return <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
		exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} className="rsvp-editor"
		onAnimationComplete={() => { if (present) setReady(true); }}>
		<div className="rsvp-editor-content">
		<label htmlFor={`${id}-input`}>
			{isReplacement ? (openingValue.current.trim() ? 'Editar reemplazo' : 'Nombre del reemplazo') : 'Nombre del acompañante'}
		</label>
		<div className="rsvp-editor-fields">
			<input ref={input} id={`${id}-input`} data-focus-ready={ready && present} type="text" value={value} maxLength={100}
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
		</div>
	</motion.div>;
}
