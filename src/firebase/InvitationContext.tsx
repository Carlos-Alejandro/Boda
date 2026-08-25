import {
	createContext,
	type ReactNode,
	useContext,
} from 'react';

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

const RSVP_CLOSE_DATE = new Date('2028-03-12T05:00:00.000Z');

export function InvitationProvider({
	invitation,
	loading,
	error,
	children,
}: InvitationProviderProps) {
	const now = new Date();

	const isGeneralRsvpClosed =
		now.getTime() >= RSVP_CLOSE_DATE.getTime();

	const hasActiveOverride =
		invitation?.editOverrideUntil instanceof Date &&
		now.getTime() < invitation.editOverrideUntil.getTime();

	const canEditRsvp =
		!isGeneralRsvpClosed || hasActiveOverride;

	const isRsvpClosed = !canEditRsvp;

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