import type { Invitation } from '../../firebase/InvitationContext';
import { parseInvitation } from '../../firebase/validateInvitation';

export const INVITATION_UNAVAILABLE_MESSAGE =
	'Esta invitaci\u00f3n no est\u00e1 disponible.';

export interface PublicInvitationSnapshot {
	id: string;
	exists(): boolean;
	data(): unknown;
}

export class InvitationUnavailableError extends Error {
	constructor() {
		super(INVITATION_UNAVAILABLE_MESSAGE);
		this.name = 'InvitationUnavailableError';
	}
}

export async function loadPublicInvitation(
	readSnapshot: () => Promise<PublicInvitationSnapshot>,
): Promise<Invitation> {
	try {
		const snapshot = await readSnapshot();
		if (!snapshot.exists()) {
			throw new InvitationUnavailableError();
		}

		const invitation = parseInvitation(snapshot.id, snapshot.data());
		if (!invitation || invitation.isArchived) {
			throw new InvitationUnavailableError();
		}
		return invitation;
	} catch {
		throw new InvitationUnavailableError();
	}
}
