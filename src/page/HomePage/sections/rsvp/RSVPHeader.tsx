import { Heart } from 'lucide-react';
import type { Invitation } from '../../../../firebase/InvitationContext';

export function RSVPHeader({ invitation, id }: { invitation?: Invitation; id: string }) {
	return <header className="rsvp-header">
		<h2 id={id}>RSVP</h2>
		<p className="rsvp-intro">Nos hará mucha ilusión<br />compartir este día contigo.</p>
		<div className="rsvp-ornament" aria-hidden="true"><span /><Heart size={12} fill="currentColor" /><span /></div>
		{invitation && <>
			<p className="rsvp-family">{invitation.displayName}</p>
			<p className="rsvp-places">{invitation.maxGuests === 1 ? 'Tenemos 1 lugar reservado para ti.' : `Tenemos ${invitation.maxGuests} lugares reservados para ustedes.`}</p>
		</>}
	</header>;
}
