import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Guest, Invitation } from '../../../../firebase/InvitationContext';
import { RSVPSection } from '../RSVPSection';
import { GuestAttendanceRow } from './GuestAttendanceRow';
import { RSVPSubmitFeedback } from './RSVPSubmitFeedback';
import { AttendanceSummary } from './AttendanceSummary';

const context = vi.hoisted(() => ({ invitation: null as Invitation | null, loading: false, error: false }));
vi.mock('../../../../firebase/InvitationContext', () => ({ useInvitation: () => context }));
vi.mock('../../../../firebase/savePublicRsvp', () => ({ savePublicRsvp: vi.fn(), RsvpConflictError: class extends Error {}, RsvpUnavailableError: class extends Error {} }));
const known: Guest = { name: 'Carlos Pérez', shortName: 'Carlos', type: 'known', attending: null };
const open: Guest = { name: '', shortName: 'Acompañante', type: 'open', attending: null };
function invitation(guests: Guest[]): Invitation {
	return { id: 'test', displayName: 'Familia Pérez', guests, maxGuests: guests.length, replacementsAllowed: true,
		rsvpStatus: 'pending', message: '', isArchived: false, archivedAt: null, editOverrideUntil: null, updatedAt: null };
}
const noop = () => {};
function row(overrides: Partial<Parameters<typeof GuestAttendanceRow>[0]> = {}) {
	return renderToStaticMarkup(<GuestAttendanceRow id="guest" guest={known} position={1} response={null} name=""
		replacementsAllowed editable expanded={false} error={null} onExpand={noop} onSelect={noop} onName={noop}
		onClear={noop} onRestore={noop} {...overrides} />);
}
afterEach(() => vi.useRealTimers());

describe('RSVP server rendering (no DOM environment required)', () => {
	it.each([1, 2, 4, 6, 12, 30])('renders %i complete guests and one final submit', count => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2027-01-01'));
		context.invitation = invitation(Array.from({ length: count }, (_, i) => ({ ...known, name: `Invitado ${i} Apellido completo` })));
		const html = renderToStaticMarkup(<RSVPSection />);
		expect(html.match(/class="rsvp-row"/g)).toHaveLength(count);
		expect(html.match(/type="submit"/g)).toHaveLength(1);
		expect(html.match(/aria-pressed="false"/g)).toHaveLength(count * 2);
		expect(html).toContain(`Invitado ${count - 1} Apellido completo`);
		expect(html).not.toContain('min-h-svh');
		expect(html).toMatch(/maxlength="500"/i);
	});
	it.each([true, false, null])('keeps the toggle accessible and marks response %s beyond color', response => {
		const html = row({ response });
		expect(html).toContain('role="group" aria-labelledby="guest-name"');
		expect(html.match(/aria-pressed="true"/g) ?? []).toHaveLength(response === null ? 0 : 1);
		expect(html.match(/aria-pressed="false"/g)).toHaveLength(response === null ? 2 : 1);
		if (response !== null) expect(html).toContain(response ? 'lucide-check' : 'lucide-x');
		else expect(html).not.toContain('<svg');
		expect(html).toContain('type="button"');
	});
	it('reveals only a contextual action after No and respects replacement permission', () => {
		expect(row({ response: false })).toContain('Agregar reemplazo');
		expect(row({ response: false })).not.toContain('<input');
		expect(row({ response: false, replacementsAllowed: false })).not.toContain('Agregar reemplazo');
	});
	it('keeps an empty open slot optional with no permanent input or attendance toggle', () => {
		const html = row({ guest: open });
		expect(html).toContain('Lugar disponible');
		expect(html).not.toContain('Lugar disponible 1');
		expect(html).toContain('Agregar acompañante');
		expect(html).toContain('aria-label="Agregar acompañante al lugar 1"');
		expect(html).toContain('+ </span>Agregar');
		expect(html).toContain('aria-expanded="false" aria-controls="guest-editor"');
		expect(html).not.toContain('<input');
		expect(html).not.toContain('aria-pressed');
	});
	it('groups Editar and Dejar libre beneath the full open guest name', () => {
		const name = 'Carlos Manuel Alejandro Martínez';
		const html = row({ guest: open, name });
		expect(html).toContain(name);
		expect(html).toContain('✓ Asistirá');
		const actions = html.slice(html.indexOf('class="rsvp-row-actions"'), html.indexOf('<div id="guest-editor">'));
		expect(actions).toContain(`aria-label="Editar ${name}"`);
		expect(actions).toContain('Dejar libre');
		expect(actions).toContain('aria-expanded="false" aria-controls="guest-editor"');
		expect(html.match(/id="guest-edit"/g)).toHaveLength(1);
	});
	it('labels the open editor and associates its invalid input with the error', () => {
		const html = row({ guest: open, expanded: true, name: 'A', error: 'name' });
		expect(html).toContain('for="guest-input"');
		expect(html).toContain('aria-invalid="true"');
		expect(html).toContain('guest-name-error');
		expect(html).toContain('Nombre por completar');
		expect(html).toContain('Nombre del acompañante');
		expect(html).toContain('role="alert"');
		expect(html).toContain('<strong>Revisa el nombre</strong>');
	});
	it('shows a replacement in its slot with edit and restore actions', () => {
		const html = row({ response: false, name: 'Mariana López' });
		expect(html).toContain('En lugar de Carlos Pérez');
		expect(html).toContain('Restaurar invitado original');
		expect(html).not.toContain('Retirar reemplazo');
		expect(html).not.toContain('aria-pressed');
	});
	it.each([1, 3])('numbers open places only when the invitation has multiple open slots (%i)', count => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2027-01-01'));
		context.invitation = invitation([known, ...Array.from({ length: count }, () => ({ ...open }))]);
		const html = renderToStaticMarkup(<RSVPSection />);
		if (count === 1) {
			expect(html).toContain('Lugar disponible');
			expect(html).not.toContain('Lugar disponible 1');
		} else for (let i = 1; i <= count; i++) expect(html).toContain(`Lugar disponible ${i}`);
	});
	it('keeps the replacement editor compact with edit and restore actions', () => {
		const html = row({ response: false, name: 'Carlitos 2', expanded: true });
		expect(html).toContain('Editar reemplazo');
		expect(html).toContain('value="Carlitos 2"');
		expect(html).toContain('Listo');
		expect(html).toContain('Cancelar');
		expect(html).toContain('En lugar de Carlos Pérez');
		expect(html).toContain('Restaurar invitado original');
		expect(html).not.toContain('Retirar reemplazo');
		expect(html).not.toContain('será utilizado por');
		expect(html).not.toContain('Al agregar su nombre');
		expect(html).not.toContain('Carlos Pérez sí asistirá');
		expect(html.match(/✓ Asistirá/g)).toHaveLength(1);
	});
	it('keeps replacement identity once and both actions in the same group', () => {
		const html = row({ response: false, name: 'Mariana López' });
		expect(html).toContain('id="guest-name">Mariana López</p>');
		expect(html).toContain('class="rsvp-note rsvp-replacement-status">✓ Asistirá</p>');
		const actions = html.slice(html.indexOf('class="rsvp-row-actions'), html.indexOf('<div id="guest-editor">'));
		expect(actions).toContain('>Editar</button>');
		expect(actions).toContain('Restaurar invitado original');
		expect(actions).toContain('lucide-undo-2');
		expect(actions).not.toContain('Carlos Pérez');
		expect(actions.match(/<button/g)).toHaveLength(2);
		expect(html.split('Carlos Pérez')).toHaveLength(2);
	});
	it('keeps replacement-only presentation out of known and open rows', () => {
		for (const html of [row(), row({ guest: open }), row({ guest: open, name: 'Mariana' })]) {
			expect(html).not.toContain('rsvp-replacement-actions');
			expect(html).not.toContain('rsvp-replacement-status');
			expect(html).not.toContain('Restaurar invitado original');
		}
		expect(row({ guest: open, name: 'Mariana' })).toContain('Dejar libre');
	});
	it('warns about a saved replacement when replacements have been disabled', () => {
		const html = row({ response: false, name: 'Mariana', replacementsAllowed: false });
		expect(html).toContain('Al confirmar, este lugar quedará sin utilizar');
		expect(html).not.toContain('>Editar<');
		expect(html).not.toContain('Retirar reemplazo');
		expect(html).toContain('id="guest-clear"');
		expect(html).toContain('aria-describedby="guest-unavailable"');
		expect(html).toContain('Restaurar invitado original');
	});
	it('renders deadline read-only and permits an active exceptional editing period', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2029-01-01'));
		context.invitation = invitation([{ ...known, attending: true }]);
		let html = renderToStaticMarkup(<RSVPSection />);
		expect(html).toContain('La confirmación está cerrada');
		expect(html).not.toContain('type="submit"');
		expect(html).not.toContain('aria-pressed');
		context.invitation.editOverrideUntil = new Date('2030-01-01');
		html = renderToStaticMarkup(<RSVPSection />);
		expect(html).toContain('Puedes modificar tu respuesta hasta');
		expect(html).toContain('type="submit"');
	});
	it('keeps conflict distinct from retryable errors and disables resubmission', () => {
		const conflict = renderToStaticMarkup(<RSVPSubmitFeedback status="idle" block="conflict" alreadySaved={false} editable />);
		expect(conflict).toContain('disabled=""');
		expect(conflict).toContain('Actualizar invitación');
		expect(conflict).toContain('se reemplazarán tus cambios sin guardar');
		const error = renderToStaticMarkup(<RSVPSubmitFeedback status="error" block={null} alreadySaved={false} editable />);
		expect(error).toContain('inténtalo nuevamente');
		expect(error).toContain('<strong>No pudimos guardar</strong>');
		expect(error).toContain('tabindex="-1"');
		expect(conflict).toContain('<strong>La invitación fue actualizada</strong>');
		expect(conflict).toContain('type="button" class="rsvp-alert-action"');
		expect(conflict).toContain('role="alert"');
		expect(error).not.toContain('disabled');
	});
	it('announces saving/success and offers update after a committed response', () => {
		const saving = renderToStaticMarkup(<RSVPSubmitFeedback status="saving" block={null} alreadySaved={false} editable />);
		expect(saving).toContain('disabled=""');
		expect(saving).toContain('Guardando…');
		const success = renderToStaticMarkup(<RSVPSubmitFeedback status="success" block={null} alreadySaved editable />);
		expect(success).toContain('role="status"');
		expect(success).toContain('Tu respuesta se guardó correctamente.');
		expect(success).toContain('lucide-check');
		expect(success).not.toContain('role="alert"');
		expect(success).toContain('Actualizar asistencia');
	});
	it.each([
		[1, 2, 1, '1 de 2 asistirá', 'Falta responder por 1 persona'],
		[2, 4, 0, '2 de 4 asistirán', null],
		[0, 4, 4, '0 de 4 asistirán', 'Falta responder por 4 personas'],
	] as const)('retains summary grammar for %i attendees out of %i', (attending, total, unanswered, count, pending) => {
		const html = renderToStaticMarkup(<AttendanceSummary attending={attending} total={total} unanswered={unanswered} />);
		expect(html).toContain(count);
		if (pending) expect(html).toContain(pending);
		else expect(html).not.toContain('Falta responder');
	});
	it('shows validation alerts at the field and by the submit without changing validation rules', () => {
		const field = row({ error: 'response' });
		expect(field).toContain('aria-describedby="guest-error"');
		expect(field).toContain('<strong>Falta tu respuesta</strong>');
		const html = renderToStaticMarkup(<RSVPSubmitFeedback status="idle" block={null} alreadySaved={false} editable validationError />);
		expect(html).toContain('<strong>Revisa tus respuestas</strong>');
		expect(html).toContain('role="alert"');
		expect(html).not.toContain('disabled');
	});
	it.each(['conflict', 'unavailable'] as const)('keeps %s blocking submit and offers an explicit refresh', block => {
		const html = renderToStaticMarkup(<RSVPSubmitFeedback status="idle" block={block} alreadySaved editable validationError />);
		expect(html).toContain('disabled=""');
		expect(html.match(/role="alert"/g)).toHaveLength(1);
		expect(html).toContain('Actualizar invitación');
		expect(html).toContain('se reemplazarán tus cambios sin guardar');
	});
});
