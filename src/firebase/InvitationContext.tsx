import {
	createContext,
	type ReactNode,
	useContext,
} from 'react';

import { getRsvpAvailability } from './rsvpAvailability';

export interface Guest {
	name: string;
	shortName: string;
	type: 'known' | 'open' | 'replacement';
	attending: boolean | null;
	originalName?: string;
}

export interface Invitation {
	id: string;
	displayName: string;
	maxGuests: number;
	replacementsAllowed: boolean;
	rsvpStatus: string;
	message: string;
	isArchived: boolean;
	archivedAt: Date | null;
	updatedAt: unknown;
	editOverrideUntil: Date | null;
	guests: Guest[];
}

interface InvitationContextValue {
	invitation: Invitation | null;
	loading: boolean;
	error: boolean;
	isRsvpClosed: boolean;
	canEditRsvp: boolean;
}

const InvitationContext =
	createContext<InvitationContextValue | null>(null);

interface InvitationProviderProps {
	invitation: Invitation | null;
	loading: boolean;
	error: boolean;
	children: ReactNode;
}

export function InvitationProvider({
	invitation,
	loading,
	error,
	children,
}: InvitationProviderProps) {
	const now = new Date();

	const { canEditRsvp, isRsvpClosed } =
		getRsvpAvailability(invitation, now);

	return (
		<InvitationContext.Provider
			value={{
				invitation,
				loading,
				error,
				isRsvpClosed,
				canEditRsvp,
			}}
		>
			{children}
		</InvitationContext.Provider>
	);
}

export function useInvitation() {
	const context = useContext(InvitationContext);

	if (!context) {
		throw new Error(
			'useInvitation debe utilizarse dentro de InvitationProvider',
		);
	}

	return context;
}
