import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '../../firebase/firebase';
import {
	InvitationProvider,
	type Invitation,
} from '../../firebase/InvitationContext';
import { HomePage } from '../HomePage/HomePage';
import {
	loadPublicInvitation,
} from './loadPublicInvitation';
import { InvitationUnavailable } from './InvitationUnavailable';

export function InvitationPage() {
	const { id } = useParams();
	const [invitation, setInvitation] = useState<Invitation | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function loadInvitation() {
			if (!id) {
				setError(true);
				setLoading(false);
				return;
			}

			try {
				const invitationRef = doc(db, 'invitations', id);
				const loadedInvitation = await loadPublicInvitation(
					() => getDoc(invitationRef),
				);
				setInvitation(loadedInvitation);
				setError(false);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		}

		void loadInvitation();
	}, [id]);

	if (!loading && error) {
		return <InvitationUnavailable />;
	}

	return (
		<InvitationProvider
			invitation={invitation}
			loading={loading}
			error={error}
		>
			<HomePage showRsvp />
		</InvitationProvider>
	);
}
