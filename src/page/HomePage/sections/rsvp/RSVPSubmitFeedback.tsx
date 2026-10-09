import { Check } from 'lucide-react';
import { RSVPAlert } from './RSVPAlert';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'declined' | 'restored' | 'empty' | 'error';
export type SaveBlock = 'conflict' | 'unavailable' | null;

export function RSVPSubmitFeedback({ status, block, alreadySaved, editable, validationError = false, declineAllAvailable = false, onDeclineAll }: {
	status: SaveStatus; block: SaveBlock; alreadySaved: boolean; editable: boolean;
	validationError?: boolean; declineAllAvailable?: boolean; onDeclineAll?: () => void;
}) {
	return <div className="rsvp-submit">
		{editable && <button type="submit" className="rsvp-primary" disabled={status === 'saving' || block !== null}>
			{status === 'saving' ? 'Guardando…' : alreadySaved ? 'Actualizar asistencia' : 'Confirmar asistencia'}
		</button>}
		{editable && declineAllAvailable && <>
			<button type="button" className="rsvp-action rsvp-decline" disabled={status === 'saving' || block !== null} onClick={onDeclineAll}>
				Nadie asistirá
			</button>
			<p className="rsvp-note">Elige esta opción si nadie de la invitación asistirá.</p>
		</>}
		<p className="rsvp-save-status" role="status" aria-live="polite">
			{(status === 'success' || status === 'declined' || status === 'restored') && <Check size={15} aria-hidden="true" />}
			{status === 'saving' ? 'Estamos guardando tu respuesta…' : status === 'success' ? 'Tu respuesta se guardó correctamente.' : status === 'declined' ? 'Se registró que nadie asistirá.' : status === 'restored' ? 'Se restauró al invitado original. Su asistencia quedó pendiente de confirmación.' : ''}
		</p>
		{status === 'empty' && <RSVPAlert title="Indica tu respuesta">
			<p>Agrega el nombre de al menos una persona o elige «Nadie asistirá».</p>
		</RSVPAlert>}
		{status === 'error' && !block && <RSVPAlert title="No pudimos guardar" focusOnMount>
			<p>Tu respuesta no se guardó. Revisa tu conexión e inténtalo nuevamente. Conservamos lo que escribiste.</p>
		</RSVPAlert>}
		{validationError && !block && status !== 'error' && status !== 'empty' && <RSVPAlert title="Revisa tus respuestas">
			<p>Completa las respuestas o corrige los nombres marcados antes de confirmar.</p>
		</RSVPAlert>}
		{block && <RSVPAlert key={block} title={block === 'conflict' ? 'La invitación fue actualizada' : 'No es posible guardar ahora'} focusOnMount>
			<p>{block === 'conflict'
				? 'La invitación cambió mientras la tenías abierta. Actualiza la información y revisa tus respuestas antes de volver a guardar.'
				: 'La invitación ya no permite guardar en este momento. Puede haber cerrado el plazo o haber cambiado su disponibilidad.'}</p>
			<p>Al actualizar se reemplazarán tus cambios sin guardar por la información actual.</p>
			<button type="button" className="rsvp-alert-action" onClick={() => window.location.reload()}>Actualizar invitación</button>
		</RSVPAlert>}
		{editable && <p className="rsvp-note rsvp-edit-note">Podrás modificar tu respuesta desde este enlace mientras el periodo de confirmación esté abierto.</p>}
	</div>;
}
