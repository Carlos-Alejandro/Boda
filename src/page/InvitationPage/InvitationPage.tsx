import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '../../firebase/firebase';
import {
	InvitationProvider,
	type Invitation,
} from '../../firebase/InvitationContext';
import { parseInvitation } from '../../firebase/validateInvitation';
import { HomePage } from '../HomePage/HomePage';

export function InvitationPage() {
	const { id } = useParams();

	const [invitation, setInvitation] =
		useState<Invitation | null>(null);

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
				const invitationRef = doc(
					db,
					'invitations',
					id,
				);

				const snapshot =
					await getDoc(invitationRef);

				if (!snapshot.exists()) {
					console.error(
						'La invitación no existe:',
						id,
					);

					setError(true);
					return;
				}

				const parsedInvitation =
					parseInvitation(
						snapshot.id,
						snapshot.data(),
					);

				if (!parsedInvitation) {
					console.error(
						'La invitación contiene datos inválidos:',
						snapshot.id,
					);

					setError(true);
					return;
				}

				setInvitation(parsedInvitation);
				setError(false);
			} catch (err) {
				console.error(
					'Error cargando invitación:',
					err,
				);

				setError(true);
			} finally {
				setLoading(false);
			}
		}

		void loadInvitation();
	}, [id]);

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
