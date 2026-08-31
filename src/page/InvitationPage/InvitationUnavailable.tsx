import { INVITATION_UNAVAILABLE_MESSAGE } from './loadPublicInvitation';

export function InvitationUnavailable() {
	return (
		<main className="grid min-h-svh place-items-center bg-[#FAF8F3] px-6 text-center text-[#5F5947]">
			<p className="font-['Cinzel'] text-sm tracking-[0.08em]">
				{INVITATION_UNAVAILABLE_MESSAGE}
			</p>
		</main>
	);
}
