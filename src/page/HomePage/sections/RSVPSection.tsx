import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useInvitation } from '../../../firebase/InvitationContext';
import { getRsvpAvailability } from '../../../firebase/rsvpAvailability';
import { RsvpConflictError, RsvpUnavailableError, savePublicRsvp, type RsvpDraft } from '../../../firebase/savePublicRsvp';
import { createRsvpDraft, inspectRsvpDraft } from './rsvp/rsvpDraft';
import { RSVPHeader } from './rsvp/RSVPHeader';
import { GuestAttendanceRow } from './rsvp/GuestAttendanceRow';
import { AttendanceSummary } from './rsvp/AttendanceSummary';
import { RSVPMessage } from './rsvp/RSVPMessage';
import { RSVPSubmitFeedback, type SaveBlock, type SaveStatus } from './rsvp/RSVPSubmitFeedback';
import { RSVPAlert } from './rsvp/RSVPAlert';
import './rsvp/RSVP.css';

const emptyDraft: RsvpDraft = { responses: [], replacementNames: [], openGuestNames: [], message: '' };

export function RSVPSection() {
	const { invitation, loading, error } = useInvitation();
	const id = useId();
	const [base, setBase] = useState(invitation);
	const [draft, setDraft] = useState(() => invitation ? createRsvpDraft(invitation) : emptyDraft);
	const [editors, setEditors] = useState<Set<number>>(new Set());
	const [attempted, setAttempted] = useState(false);
	const [status, setStatus] = useState<SaveStatus>('idle');
	const [block, setBlock] = useState<SaveBlock>(null);
	const saving = useRef(false);
	const source = useRef(invitation);
	const [focusTarget, setFocusTarget] = useState<string | null>(null);

	useEffect(() => {
		source.current = invitation;
		setBase(invitation);
		setDraft(invitation ? createRsvpDraft(invitation) : emptyDraft);
		setEditors(new Set());
		setAttempted(false);
		setStatus('idle');
		setBlock(null);
	}, [invitation]);

	useEffect(() => {
		if (!focusTarget) return;
		const target = document.getElementById(focusTarget);
		// An opening name editor owns focus once its expansion has completed.
		if (target?.dataset.focusReady !== 'false') target?.focus();
		setFocusTarget(null);
	}, [focusTarget]);

	if (loading || error || !base) return <section className="rsvp-section" aria-labelledby={`${id}-title`}>
		<RSVPHeader id={`${id}-title`} />
		{loading ? <p role="status">Preparando tu confirmación…</p> : <RSVPAlert title="No pudimos cargar la invitación">
			<p>Actualiza la página para volver a intentarlo.</p>
		</RSVPAlert>}
	</section>;

	const { canEditRsvp } = getRsvpAvailability(base, new Date());
	const extraordinaryAccess = canEditRsvp && !getRsvpAvailability({ ...base, editOverrideUntil: null }, new Date()).canEditRsvp;
	const inspection = inspectRsvpDraft(base, draft);
	const pending = status === 'saving';
	const changeDraft = (change: (current: RsvpDraft) => RsvpDraft) => {
		if (saving.current || !canEditRsvp) return;
		setDraft(change);
		setStatus('idle');
	};
	const expand = (index: number, open: boolean) => {
		if (saving.current || !canEditRsvp) return;
		setEditors(current => {
			const next = new Set(current);
			if (open) next.add(index);
			else next.delete(index);
			return next;
		});
	};
	const select = (index: number, value: boolean) => {
		changeDraft(current => ({ ...current,
			responses: current.responses.map((response, i) => i === index ? value : response),
			replacementNames: current.replacementNames.map((name, i) => i === index && value ? '' : name),
		}));
		if (value) expand(index, false);
	};
	const updateName = (index: number, value: string) => {
		const open = base.guests[index].type === 'open';
		changeDraft(current => ({ ...current,
			[open ? 'openGuestNames' : 'replacementNames']: (open ? current.openGuestNames : current.replacementNames)
				.map((name, i) => i === index ? value : name),
			responses: open ? current.responses : current.responses.map((response, i) => i === index ? false : response),
		}));
	};

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (saving.current || block || !canEditRsvp) return;
		setAttempted(true);
		setStatus('idle');
		const firstError = inspection.errors.findIndex(value => value !== null);
		if (firstError !== -1) {
			const nameError = inspection.errors[firstError] === 'name';
			const unavailableReplacement = nameError && base.guests[firstError].type !== 'open' && !base.replacementsAllowed;
			if (nameError && !unavailableReplacement) expand(firstError, true);
			setFocusTarget(`${id}-guest-${firstError}-${unavailableReplacement ? 'clear' : nameError ? 'input' : 'answer'}`);
			return;
		}
		saving.current = true;
		setStatus('saving');
		const submittedSource = source.current;
		try {
			const saved = await savePublicRsvp(base, draft);
			// Only the committed result becomes our next base. Never reload or merge remotely.
			if (source.current !== submittedSource) return;
			setBase(saved);
			setDraft(createRsvpDraft(saved));
			setEditors(new Set());
			setAttempted(false);
			setStatus('success');
		} catch (saveError) {
			if (source.current !== submittedSource) return;
			if (saveError instanceof RsvpConflictError || saveError instanceof RsvpUnavailableError) {
				setBlock(saveError instanceof RsvpConflictError ? 'conflict' : 'unavailable');
				setStatus('idle');
			} else setStatus('error');
		} finally {
			saving.current = false;
		}
	};
	// A save-time closure must not replace the visible, unsaved inputs with the old base.
	const showDraft = canEditRsvp || block !== null;
	const attending = showDraft ? inspection.attending : base.guests.filter(guest => guest.attending === true).length;
	let openPosition = 0;
	const openCount = base.guests.filter(guest => guest.type === 'open').length;

	return <section className="rsvp-section" aria-labelledby={`${id}-title`}>
		<RSVPHeader invitation={base} id={`${id}-title`} />
		{!canEditRsvp && !block && <RSVPAlert title="La confirmación está cerrada" urgent={false}>
			<p>Si necesitas un cambio especial, comunícate con nosotros.</p>
		</RSVPAlert>}
		{extraordinaryAccess && base.editOverrideUntil && <p className="rsvp-availability">Puedes modificar tu respuesta hasta el {base.editOverrideUntil.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}.</p>}
		<form className="rsvp-form" onSubmit={submit} noValidate aria-busy={pending}>
			<fieldset className="rsvp-fields" disabled={pending || !canEditRsvp}>
				<legend className="sr-only">Respuestas de asistencia</legend>
				<div className="rsvp-surface">
					<h3 id={`${id}-list`}>¿Quiénes nos acompañarán?</h3>
					<ul className="rsvp-list" aria-labelledby={`${id}-list`}>
						{base.guests.map((guest, index) => {
							if (guest.type === 'open') openPosition++;
							return <GuestAttendanceRow key={`${base.id}-${index}`} id={`${id}-guest-${index}`} guest={guest}
								position={openPosition} openCount={openCount} response={draft.responses[index] ?? null}
								name={(guest.type === 'open' ? draft.openGuestNames[index] : draft.replacementNames[index]) ?? ''}
								replacementsAllowed={base.replacementsAllowed} editable={showDraft}
								expanded={editors.has(index)} error={attempted ? inspection.errors[index] : null}
								onExpand={open => expand(index, open)} onSelect={value => select(index, value)}
								onName={value => updateName(index, value)}
								onClear={() => { updateName(index, ''); expand(index, false); }}
								onRestore={() => select(index, true)} />;
						})}
					</ul>
				</div>
				<AttendanceSummary attending={attending} total={base.maxGuests} unanswered={showDraft ? inspection.unanswered : 0} />
				{showDraft ? <RSVPMessage id={`${id}-message`} value={draft.message}
					onChange={message => changeDraft(current => ({ ...current, message }))} />
					: base.message.trim() && <div className="rsvp-read-message"><p>Tu mensaje</p><p>“{base.message}”</p></div>}
			</fieldset>
			<RSVPSubmitFeedback status={status} block={block} alreadySaved={base.rsvpStatus !== 'pending'} editable={canEditRsvp}
				validationError={attempted && canEditRsvp && inspection.errors.some(value => value !== null)} />
			{!showDraft && <p className="rsvp-note">Esta información corresponde a la última respuesta registrada.</p>}
		</form>
	</section>;
}
