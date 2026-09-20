import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Guest } from '../../../../firebase/InvitationContext';
import { getOriginalName, type AttendanceResponse } from '../rsvpLogic';
import { AttendanceToggle } from './AttendanceToggle';
import { GuestNameEditor } from './GuestNameEditor';
import { isValidGuestName, type GuestError } from './rsvpDraft';
import { RSVPAlert } from './RSVPAlert';

export function GuestAttendanceRow({ id, guest, position, openCount = 1, response, name, replacementsAllowed,
	editable, expanded, error, onExpand, onSelect, onName, onClear, onRestore }: {
	id: string; guest: Guest; position: number; response: AttendanceResponse; name: string;
	openCount?: number;
	replacementsAllowed: boolean; editable: boolean; expanded: boolean; error: GuestError;
	onExpand: (open: boolean) => void; onSelect: (value: boolean) => void;
	onName: (value: string) => void; onClear: () => void; onRestore: () => void;
}) {
	const reducedMotion = useReducedMotion();
	const open = guest.type === 'open';
	const original = getOriginalName(guest);
	const hasName = Boolean(name.trim());
	const replacement = !open && response === false && hasName;
	const forbiddenReplacement = replacement && !replacementsAllowed;
	const canName = editable && (open || (response === false && replacementsAllowed));
	const availablePlace = openCount > 1 ? `Lugar disponible ${position}` : 'Lugar disponible';
	const displayedName = open ? (name.trim() || availablePlace)
		: replacement ? name.trim() : original;
	const finish = () => {
		onExpand(false);
		requestAnimationFrame(() => document.getElementById(`${id}-edit`)?.focus({ preventScroll: true }));
	};
	const returnFocus = (action: () => void) => {
		action();
		requestAnimationFrame(() => document.getElementById(open ? `${id}-edit` : `${id}-answer`)?.focus({ preventScroll: true }));
	};

	if (!editable) return <li className="rsvp-row" aria-labelledby={`${id}-name`}>
		<div className="rsvp-row-main">
			<div className="rsvp-person"><p id={`${id}-name`}>{open ? guest.name.trim() || availablePlace : guest.name}</p>
				{guest.type === 'replacement' && <p className="rsvp-note">En lugar de {original}</p>}</div>
			<p className="rsvp-read-status">{guest.attending === true ? '✓ Asistirá' : guest.attending === false ? (open ? 'Sin utilizar' : 'No asistirá') : 'Sin respuesta'}</p>
		</div>
	</li>;

	return <li className="rsvp-row" aria-labelledby={`${id}-name`}>
		<div className="rsvp-row-main">
			<div className="rsvp-person"><p id={`${id}-name`}>{displayedName}</p>
				{replacement && <p className="rsvp-note">En lugar de {original}</p>}
				{open && !hasName && <p className="rsvp-note">Opcional</p>}
				{(open || replacement) && hasName && <p className="rsvp-note">{forbiddenReplacement ? 'Reemplazo no disponible' : isValidGuestName(name) ? '✓ Asistirá' : 'Nombre por completar'}</p>}
			</div>
			{!open && !replacement && <AttendanceToggle id={id} response={response} invalid={error === 'response'} onSelect={onSelect} />}
			{canName && open && !hasName && <button id={`${id}-edit`} type="button" className="rsvp-action rsvp-add"
				aria-label={`Agregar acompañante al lugar ${position}`}
				aria-expanded={expanded} aria-controls={`${id}-editor`} onClick={() => onExpand(!expanded)}>
				<span aria-hidden="true">+ </span>Agregar
			</button>}
		</div>
		{!open && !replacement && canName && <button id={`${id}-edit`} type="button" className="rsvp-action"
			aria-expanded={expanded} aria-controls={`${id}-editor`} onClick={() => onExpand(!expanded)}>Agregar reemplazo</button>}
		{error === 'response' && <RSVPAlert id={`${id}-error`} title="Falta tu respuesta">
			<p>Selecciona Sí o No para {original}.</p>
		</RSVPAlert>}
		{forbiddenReplacement && <RSVPAlert id={`${id}-unavailable`} title="Reemplazo no disponible">
			<p>Esta invitación ya no permite reemplazos. Al confirmar, este lugar quedará sin utilizar, salvo que {original} sí asista.</p>
		</RSVPAlert>}
		{hasName && (open || replacement) && <div className="rsvp-row-actions">
			{canName && <button id={`${id}-edit`} type="button" className="rsvp-action"
				aria-label={`Editar ${name.trim()}`} aria-expanded={expanded} aria-controls={`${id}-editor`}
				onClick={() => onExpand(!expanded)}>Editar</button>}
			{canName && <span className="rsvp-action-divider" aria-hidden="true">·</span>}
			<button id={`${id}-clear`} type="button" className="rsvp-action" aria-describedby={forbiddenReplacement ? `${id}-unavailable` : undefined}
				onClick={() => returnFocus(onClear)}>{open ? 'Dejar libre' : 'Retirar reemplazo'}</button>
			{replacement && <button type="button" className="rsvp-action" onClick={() => returnFocus(onRestore)}>Restaurar a {original} como asistente</button>}
		</div>}
		<div id={`${id}-editor`}>
			<AnimatePresence initial={false}>
				{expanded && canName && <motion.div key="editor" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
					exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.2 }} className="rsvp-editor">
					<GuestNameEditor id={id} value={name} isReplacement={!open}
						invalid={error === 'name'} onChange={onName} onDone={finish} />
				</motion.div>}
			</AnimatePresence>
		</div>
	</li>;
}
