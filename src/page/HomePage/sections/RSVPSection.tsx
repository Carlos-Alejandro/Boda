import {Check,Heart,LockKeyhole,MessageCircle,UserRoundPlus,Users,X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useEffect, useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { useInvitation } from '../../../firebase/InvitationContext';
import { db } from '../../../firebase/firebase';
import {
	buildUpdatedGuests,
	calculateRsvpStatus,
	getOriginalName,
	getOriginalShortName,
	type AttendanceResponse,
} from './rsvpLogic';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export function RSVPSection() {
	const {
		invitation,
		loading,
		error,
		canEditRsvp,
		isRsvpClosed,
	} = useInvitation();

	const [responses, setResponses] = useState<AttendanceResponse[]>([]);
	const [replacementNames, setReplacementNames] = useState<string[]>([]);
	const [openGuestNames, setOpenGuestNames] = useState<string[]>([]);
	const [message, setMessage] = useState('');
	const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

	useEffect(() => {
		if (!invitation) return;

		setResponses(
			invitation.guests.map((guest) => {
				if (guest.type === 'replacement') {
					return false;
				}

				if (guest.type === 'open') {
					return guest.name.trim() ? true : null;
				}

				return guest.attending;
			}),
		);

		setReplacementNames(
			invitation.guests.map((guest) =>
				guest.type === 'replacement' ? guest.name : '',
			),
		);

		setOpenGuestNames(
			invitation.guests.map((guest) =>
				guest.type === 'open' ? guest.name : '',
			),
		);

		setMessage(invitation.message ?? '');
		setHasAttemptedSubmit(false);
		setSaveStatus('idle');
	}, [invitation]);

	if (loading) {
		return (
			<section className="relative overflow-hidden bg-[#FAF8F3] px-6 py-20 text-center text-[#5F5947]">
				<motion.div
					className="mx-auto max-w-[345px]"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<p className="font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#7C8B68]">
						Confirmar asistencia
					</p>

					<h2 className="mt-2 font-['Allura'] text-[4.2rem] leading-none text-[#A98445]">
						RSVP
					</h2>

					<p className="mt-6 text-[0.8rem] italic text-[#8A806D]">
						Preparando tu confirmación...
					</p>
				</motion.div>
			</section>
		);
	}

	if (error || !invitation) {
		return (
			<section className="relative overflow-hidden bg-[#FAF8F3] px-6 py-20 text-center text-[#5F5947]">
				<div className="mx-auto max-w-[345px]">
					<p className="font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#7C8B68]">
						Confirmar asistencia
					</p>

					<h2 className="mt-2 font-['Allura'] text-[4.2rem] leading-none text-[#A98445]">
						RSVP
					</h2>

					<p className="mx-auto mt-6 max-w-[290px] text-[0.8rem] leading-6 text-[#8A806D]">
						No pudimos cargar la información de esta invitación.
					</p>
				</div>
			</section>
		);
	}

	const hasUnansweredGuests = invitation.guests.some(
		(guest, index) =>
			guest.type !== 'open' &&
			responses[index] === null,
	);

	const hasInvalidReplacement = invitation.guests.some(
		(guest, index) =>
			guest.type !== 'open' &&
			responses[index] === false &&
			replacementNames[index]?.trim().length > 0 &&
			replacementNames[index].trim().length < 2,
	);

	const hasInvalidOpenGuest = invitation.guests.some(
		(guest, index) =>
			guest.type === 'open' &&
			openGuestNames[index]?.trim().length > 0 &&
			openGuestNames[index].trim().length < 2,
	);

	const confirmedGuestsCount = invitation.guests.reduce(
		(count, guest, index) => {
			if (guest.type === 'open') {
				return openGuestNames[index]?.trim()
					? count + 1
					: count;
			}

			if (responses[index] === true) {
				return count + 1;
			}

			if (
				responses[index] === false &&
				replacementNames[index]?.trim()
			) {
				return count + 1;
			}

			return count;
		},
		0,
	);

	const nominalGuestCount = invitation.guests.filter(
		(guest) => guest.type !== 'open',
	).length;

	const openGuestCount = invitation.guests.filter(
		(guest) => guest.type === 'open',
	).length;

	const usesMixedTwoColumnLayout =
		invitation.guests.length === 2 &&
		nominalGuestCount === 1 &&
		openGuestCount === 1;

	const usesTwoColumnLayout =
		nominalGuestCount === 2 || usesMixedTwoColumnLayout;
	const usesCompactListLayout = nominalGuestCount >= 3;

	const getGuestNameSizeClass = (name: string) => {
		if (name.length > 28) {
			return 'text-[clamp(1.45rem,6vw,1.6rem)]';
		}

		if (name.length > 16) {
			return 'text-[clamp(1.7rem,7vw,1.9rem)]';
		}

		return 'text-[2.2rem]';
	};

	const selectAttendance = (
		guestIndex: number,
		attending: boolean,
	) => {
		if (!canEditRsvp) return;

		setResponses((current) =>
			current.map((response, index) =>
				index === guestIndex ? attending : response,
			),
		);

		if (attending) {
			setReplacementNames((current) =>
				current.map((name, index) =>
					index === guestIndex ? '' : name,
				),
			);
		}

		setSaveStatus('idle');
	};

	const updateReplacementName = (
		guestIndex: number,
		value: string,
	) => {
		if (!canEditRsvp) return;

		setReplacementNames((current) =>
			current.map((name, index) =>
				index === guestIndex ? value : name,
			),
		);

		setResponses((current) =>
			current.map((response, index) =>
				index === guestIndex ? false : response,
			),
		);

		setSaveStatus('idle');
	};

	const updateOpenGuestName = (
		guestIndex: number,
		value: string,
	) => {
		if (!canEditRsvp) return;

		setOpenGuestNames((current) =>
			current.map((name, index) =>
				index === guestIndex ? value : name,
			),
		);

		setSaveStatus('idle');
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (!canEditRsvp) return;

		setHasAttemptedSubmit(true);
		setSaveStatus('idle');

		if (
			hasUnansweredGuests ||
			hasInvalidReplacement ||
			hasInvalidOpenGuest
		) {
			return;
		}

		const updatedGuests = buildUpdatedGuests(
			invitation.guests,
			invitation.replacementsAllowed,
			responses,
			replacementNames,
			openGuestNames,
		);

		const rsvpStatus = calculateRsvpStatus(updatedGuests);

		try {
			setSaveStatus('saving');

			const invitationRef = doc(
				db,
				'invitations',
				invitation.id,
			);

			await updateDoc(invitationRef, {
				guests: updatedGuests,
				message: message.trim(),
				rsvpStatus,
				updatedAt: serverTimestamp(),
			});

			setSaveStatus('success');
		} catch (saveError) {
			console.error(
				'❌ Error guardando RSVP:',
				saveError,
			);

			setSaveStatus('error');
		}
	};

	return (
		<section className="relative min-h-svh overflow-hidden bg-[#FAF8F3] px-4 py-14 text-center text-[#5F5947] min-[380px]:px-5 sm:px-6 sm:py-16">
			<div className="pointer-events-none absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-[#D8B46A]/[0.06] blur-3xl" />

			<motion.div
				className="relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-[620px] flex-col justify-center"
				initial={{ opacity: 0, y: 22 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.12 }}
				transition={{
					duration: 0.8,
					ease: 'easeOut',
				}}
			>
				<p className="font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#7C8B68]">
					Confirmar asistencia
				</p>

				<h2 className="mt-1 font-['Allura'] text-[3.8rem] leading-none text-[#A98445]">
					RSVP
				</h2>

				<p className="mx-auto mt-3 max-w-[310px] text-[0.84rem] italic leading-5 text-[#6D6654]">
					Nos hará mucha ilusión compartir este día contigo.
				</p>

				<div className="mx-auto mt-4 flex w-28 items-center gap-3 text-[#A98445]">
					<span className="h-px flex-1 bg-[#A98445]/35" />

					<Heart
						size={13}
						fill="currentColor"
						strokeWidth={1.3}
					/>

					<span className="h-px flex-1 bg-[#A98445]/35" />
				</div>

				<div className="mt-4">
					<p className="font-['Cinzel'] text-[0.95rem] font-semibold tracking-[0.08em] text-[#6F7563]">
						{invitation.displayName}
					</p>

					<p className="mx-auto mt-2 max-w-[330px] text-[0.78rem] leading-5 text-[#6D6654]">
						Hemos reservado {invitation.maxGuests}{' '}
						{invitation.maxGuests === 1
							? 'lugar especialmente para ti'
							: 'lugares especialmente para ustedes'}
						.
					</p>

					<p className="mt-2 font-['Cinzel'] text-[0.54rem] font-semibold uppercase tracking-[0.14em] text-[#A98445]">
						{confirmedGuestsCount} de {invitation.maxGuests}{' '}
						{invitation.maxGuests === 1
							? 'lugar confirmado'
							: 'lugares confirmados'}
					</p>
				</div>

				{isRsvpClosed && (
					<div className="mx-auto mt-5 max-w-[390px] rounded-[1.4rem] border border-[#D8CDB9] bg-[#FFFDF8]/80 px-4 py-4">
						<LockKeyhole
							size={22}
							strokeWidth={1.4}
							className="mx-auto text-[#A98445]"
						/>

						<p className="mt-2 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#7C8B68]">
							Confirmación cerrada
						</p>

						<p className="mx-auto mt-2 max-w-[330px] text-[0.75rem] leading-5 text-[#6D6654]">
							El periodo para modificar tu asistencia ha
							finalizado.
						</p>

						<p className="mx-auto mt-1 max-w-[330px] text-[0.68rem] italic leading-5 text-[#8A806D]">
							Si necesitas realizar algún cambio especial,
							por favor comunícate con nosotros.
						</p>
					</div>
				)}

				<form
					className="mt-5"
					onSubmit={handleSubmit}
					noValidate
				>
					{usesCompactListLayout && (
						<p className="mb-2 font-['Cinzel'] text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#8A806D]">
							Indica quiénes nos acompañarán
						</p>
					)}

					<div
						className={`border-y border-[#D8CDB9] ${
							usesTwoColumnLayout
								? 'grid grid-cols-2 gap-x-3'
								: 'block'
						}`}
					>
						{invitation.guests.map(
							(guest, index) => {
								if (guest.type === 'open') {
									const openGuestName =
										openGuestNames[index] ?? '';

									return (
										<motion.fieldset
											key={`open-${index}`}
											className={`border-b border-[#D8CDB9] px-1 last:border-b-0 ${
												usesMixedTwoColumnLayout
													? 'order-2 grid grid-rows-[5rem_1.75rem_2.75rem] content-start py-5'
													: usesTwoColumnLayout
														? 'order-3 col-span-full py-5'
														: 'py-5'
											}`}
											initial={{
												opacity: 0,
												y: 14,
											}}
											whileInView={{
												opacity: 1,
												y: 0,
											}}
											viewport={{
												once: true,
												amount: 0.45,
											}}
											transition={{
												delay: index * 0.1,
												duration: 0.65,
												ease: 'easeOut',
											}}
										>
											<p className={`flex w-full min-w-0 items-center justify-center gap-2 px-1 text-center font-['Allura'] text-[#6F7563] ${
												usesMixedTwoColumnLayout
													? 'h-full text-[2.05rem] leading-tight'
													: 'text-[2.35rem] leading-none'
											}`}>
												{!usesMixedTwoColumnLayout && (
													<Users
														size={17}
														strokeWidth={1.4}
														className="text-[#A98445]"
													/>
												)}
												Acompañante
											</p>

											<div className={usesMixedTwoColumnLayout ? 'contents' : 'mt-2'}>

												{canEditRsvp ? (
													<>
																{!usesMixedTwoColumnLayout && (
																	<p className="mx-auto max-w-[330px] text-[0.75rem] leading-5 text-[#6D6654]">
																		Si deseas utilizar este
																		lugar, escribe el nombre
																		de tu acompañante.
																	</p>
																)}

																<p className={`${usesMixedTwoColumnLayout ? 'flex h-full items-center justify-center' : 'mt-2'} font-['Cinzel'] text-[0.48rem] font-semibold uppercase tracking-[0.18em] text-[#9A917F]`}>
															Opcional
														</p>

														<input
															type="text"
															value={openGuestName}
															onChange={(event) =>
																updateOpenGuestName(
																	index,
																	event.target.value,
																)
															}
																	maxLength={100}
																	placeholder={
																		usesMixedTwoColumnLayout
																			? 'Nombre...'
																			: 'Nombre de tu acompañante'
																	}
																	className={`${usesMixedTwoColumnLayout ? 'mt-0 h-11 self-start px-3 py-0' : 'mt-3 min-h-11 px-5 py-3'} w-full rounded-full border border-[#D8CDB9] bg-[#FFFDF8] text-center text-[0.82rem] text-[#5F5947] outline-none transition placeholder:text-[#AAA292] focus:border-[#A98445]/70 focus:ring-2 focus:ring-[#A98445]/10`}
																/>

																{!usesMixedTwoColumnLayout && (
																<AnimatePresence initial={false}>
																	{openGuestName.trim() && (
																<motion.p
																			className={`${usesMixedTwoColumnLayout ? 'mt-2 font-[\'Cinzel\'] text-[0.48rem] font-semibold uppercase tracking-[0.12em]' : 'mt-3 text-[0.68rem] italic leading-5'} text-[#7C8B68]`}
																	initial={{
																		opacity: 0,
																		y: -4,
																	}}
																	animate={{
																		opacity: 1,
																		y: 0,
																	}}
																	exit={{
																		opacity: 0,
																		y: -4,
																	}}
																>
																			{usesMixedTwoColumnLayout
																				? '✓ Confirmado'
																				: 'Este lugar contará como confirmado.'}
																</motion.p>
																	)}
																</AnimatePresence>
																)}
													</>
												) : (
													<p className="mx-auto mt-4 max-w-[270px] text-[0.78rem] leading-5 text-[#6D6654]">
														{guest.attending &&
														guest.name.trim()
															? guest.name
															: 'Este lugar quedó sin utilizar.'}
													</p>
												)}
											</div>
										</motion.fieldset>
									);
								}

								const response =
									responses[index] ?? null;

								const originalName =
									getOriginalName(guest);

								const originalShortName =
									getOriginalShortName(guest);

								const displayedGuestName =
									originalName.trim() || originalShortName;

								const guestNameSizeClass =
									getGuestNameSizeClass(displayedGuestName);

								const nominalPosition =
									invitation.guests
										.slice(0, index)
										.filter(
											(previousGuest) =>
												previousGuest.type !== 'open',
										).length;

								const showReplacement =
									canEditRsvp &&
									invitation.replacementsAllowed &&
									response === false;

								return (
									<motion.fieldset
										key={`${originalName}-${index}`}
									className="contents"
										initial={{
											opacity: 0,
											y: 14,
										}}
										whileInView={{
											opacity: 1,
											y: 0,
										}}
										viewport={{
											once: true,
											amount: 0.45,
										}}
										transition={{
											delay: index * 0.1,
											duration: 0.65,
											ease: 'easeOut',
										}}
								>
									<div
										className={`border-b border-[#D8CDB9] px-1 last:border-b-0 ${
											usesTwoColumnLayout
												? `order-1 grid grid-rows-[5rem_1.75rem_2.75rem] content-start py-5 ${
														nominalPosition === 0
															? 'border-r border-r-[#D8CDB9]'
															: ''
													}`
												: usesCompactListLayout
													? 'flex min-h-[68px] items-center justify-between gap-3 py-3 text-left'
													: 'mx-auto max-w-[320px] py-5'
										}`}
									>
									<p className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-balance text-center font-['Allura'] leading-tight text-[#6F7563] ${guestNameSizeClass} ${
										usesCompactListLayout
											? 'flex min-h-12 flex-1 items-center justify-center px-1'
											: usesTwoColumnLayout
												? 'flex h-full w-full items-center justify-center px-1'
												: 'flex min-h-14 w-full items-center justify-center px-1'
									}`}>
										{displayedGuestName}
									</p>

										{canEditRsvp ? (
											<>
												{!usesCompactListLayout && (
											<p className={`${usesTwoColumnLayout ? 'flex h-full items-center justify-center' : 'mt-2'} font-['Cinzel'] text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-[#8A806D]`}>
														¿Nos acompañas?
													</p>
												)}

										<div className={`${usesCompactListLayout ? 'w-[142px] shrink-0' : usesTwoColumnLayout ? 'w-full self-start' : 'mt-3 w-full'} grid grid-cols-2 gap-2`}>
													<button
														type="button"
														onClick={() =>
															selectAttendance(
																index,
																true,
															)
														}
														aria-pressed={
															response === true
														}
														className={`flex min-h-11 w-full items-center justify-center gap-1 rounded-full border px-2 py-2 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.08em] transition active:scale-[0.98] ${
															response === true
																? 'border-[#7C8B68] bg-[#7C8B68] text-[#FFF8EC] shadow-[0_12px_28px_rgba(95,89,71,0.16)]'
																: 'border-[#BFC5B4] bg-[#FFFDF8]/70 text-[#6F7563] hover:bg-[#F2F0E8]'
														}`}
													>
														<Check
															size={15}
															strokeWidth={1.8}
														/>
														Sí
													</button>

													<button
														type="button"
														onClick={() =>
															selectAttendance(
																index,
																false,
															)
														}
														aria-pressed={
															response === false
														}
														className={`flex min-h-11 w-full items-center justify-center gap-1 rounded-full border px-2 py-2 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.08em] transition active:scale-[0.98] ${
															response === false
																? 'border-[#A98445] bg-[#F0E4CF] text-[#765D32] shadow-[0_10px_24px_rgba(169,132,69,0.12)]'
																: 'border-[#D8CDB9] bg-transparent text-[#7C7464] hover:bg-[#F7F3EA]'
														}`}
													>
														<X
															size={14}
															strokeWidth={1.7}
														/>
														No
													</button>
												</div>
											</>
										) : (
											<div className={usesCompactListLayout ? 'shrink-0' : 'mt-3'}>
												{guest.type === 'replacement' ? (
													<>
														<p className="font-['Cinzel'] text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[#8A806D]">
															No asistirá
														</p>

														<p className="mt-3 text-[0.76rem] leading-5 text-[#6D6654]">
															Su lugar será ocupado por{' '}
															<strong className="font-medium text-[#765D32]">
																{guest.name}
															</strong>
															.
														</p>
													</>
												) : guest.attending === true ? (
													<p className="inline-flex items-center gap-2 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#7C8B68]">
														<Check
															size={15}
															strokeWidth={1.8}
														/>
														Asistirá
													</p>
												) : guest.attending === false ? (
													<p className="inline-flex items-center gap-2 font-['Cinzel'] text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8A806D]">
														<X
															size={14}
															strokeWidth={1.7}
														/>
														No asistirá
													</p>
												) : (
													<p className="text-[0.75rem] italic text-[#8A806D]">
														No se registró una respuesta.
													</p>
												)}
											</div>
										)}
									</div>

									<AnimatePresence>
											{showReplacement && (
												<motion.div
													initial={{
														opacity: 0,
														height: 0,
														y: -8,
													}}
													animate={{
														opacity: 1,
														height: 'auto',
														y: 0,
													}}
													exit={{
														opacity: 0,
														height: 0,
														y: -8,
													}}
													transition={{
														duration: 0.35,
														ease: 'easeOut',
													}}
													className={`overflow-hidden ${
														usesTwoColumnLayout
															? `${
																	usesMixedTwoColumnLayout
																		? 'order-3'
																		: 'order-2'
																} col-span-full`
															: ''
													}`}
												>
													<div className="my-3 rounded-[1.4rem] border border-[#D8CDB9] bg-[#FFFDF8]/70 px-4 py-4">
														<UserRoundPlus
															size={20}
															strokeWidth={1.4}
															className="mx-auto text-[#A98445]"
														/>

														<p className="mt-2 font-['Cinzel'] text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-[#7C8B68]">
															¿Alguien ocupará el lugar de {originalShortName}?
														</p>

														<p className="mx-auto mt-2 max-w-[260px] text-[0.72rem] italic leading-5 text-[#8A806D]">
															Si deseas ceder tu lugar,
															escribe el nombre de la
															persona que asistirá.
														</p>

														<input
															type="text"
															value={
																replacementNames[
																	index
																] ?? ''
															}
															onChange={(event) =>
																updateReplacementName(
																	index,
																	event.target
																		.value,
																)
															}
															maxLength={100}
															placeholder="Nombre del invitado"
															className="mt-4 w-full rounded-full border border-[#D8CDB9] bg-[#FFFDF8] px-5 py-3 text-center text-[0.8rem] text-[#5F5947] outline-none transition placeholder:text-[#AAA292] focus:border-[#A98445]/70 focus:ring-2 focus:ring-[#A98445]/10"
														/>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.fieldset>
								);
							},
						)}
					</div>

					{canEditRsvp ? (
						<>
							<div className="mt-5 text-left">
								<label
									htmlFor="rsvp-message"
									className="block text-center"
								>
									<span className="font-['Allura'] text-[2.15rem] leading-none text-[#A98445]">
										Déjanos un mensaje
									</span>

									<span className="ml-2 align-middle font-['Cinzel'] text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-[#8A806D]">
										· Opcional
									</span>
								</label>

								<div className="relative mt-3">
									<MessageCircle
										size={17}
										strokeWidth={1.4}
										className="pointer-events-none absolute left-4 top-4 text-[#A98445]/65"
										aria-hidden="true"
									/>

									<textarea
										id="rsvp-message"
										value={message}
										onChange={(event) => {
											setMessage(
												event.target.value,
											);
											setSaveStatus('idle');
										}}
										maxLength={500}
									rows={3}
										placeholder="Escribe aquí tus buenos deseos..."
										className="w-full resize-none rounded-[1.6rem] border border-[#D8CDB9] bg-[#FFFDF8]/80 py-4 pl-11 pr-4 text-[0.82rem] leading-6 text-[#5F5947] outline-none transition placeholder:text-[#A79F90] focus:border-[#A98445]/70 focus:ring-2 focus:ring-[#A98445]/10"
									/>
								</div>
							</div>

							<AnimatePresence initial={false}>
								{hasAttemptedSubmit &&
									hasUnansweredGuests && (
										<motion.p
											className="mx-auto mt-3 max-w-[360px] rounded-2xl border border-[#C9A86B]/35 bg-[#F6ECDD] px-4 py-2.5 text-center text-[0.74rem] leading-5 text-[#765D32]"
											initial={{
												opacity: 0,
												y: -6,
											}}
											animate={{
												opacity: 1,
												y: 0,
											}}
											exit={{
												opacity: 0,
												y: -6,
											}}
											role="alert"
										>
											Selecciona una respuesta para
											cada invitado antes de
											continuar.
										</motion.p>
									)}

								{hasAttemptedSubmit &&
									(hasInvalidReplacement ||
										hasInvalidOpenGuest) && (
										<motion.p
											className="mx-auto mt-3 max-w-[360px] rounded-2xl border border-[#C9A86B]/35 bg-[#F6ECDD] px-4 py-2.5 text-center text-[0.74rem] leading-5 text-[#765D32]"
											initial={{
												opacity: 0,
												y: -6,
											}}
											animate={{
												opacity: 1,
												y: 0,
											}}
											exit={{
												opacity: 0,
												y: -6,
											}}
											role="alert"
										>
											Revisa el nombre ingresado antes
											de continuar.
										</motion.p>
									)}

								{saveStatus === 'success' && (
									<motion.p
									className="mx-auto mt-3 max-w-[360px] rounded-2xl border border-[#7C8B68]/30 bg-[#EEF1E9] px-4 py-2.5 text-center text-[0.74rem] leading-5 text-[#657054]"
										initial={{
											opacity: 0,
											y: -6,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										exit={{
											opacity: 0,
											y: -6,
										}}
									>
										Tu confirmación se guardó
										correctamente.
									</motion.p>
								)}

								{saveStatus === 'error' && (
									<motion.p
									className="mx-auto mt-3 max-w-[360px] rounded-2xl border border-[#A98445]/35 bg-[#F6ECDD] px-4 py-2.5 text-center text-[0.74rem] leading-5 text-[#765D32]"
										initial={{
											opacity: 0,
											y: -6,
										}}
										animate={{
											opacity: 1,
											y: 0,
										}}
										exit={{
											opacity: 0,
											y: -6,
										}}
										role="alert"
									>
										No pudimos guardar tu
										confirmación. Inténtalo nuevamente.
									</motion.p>
								)}
							</AnimatePresence>

							<motion.button
								type="submit"
								disabled={saveStatus === 'saving'}
								className="mt-5 w-full rounded-full bg-[#7C8B68] px-6 py-3.5 font-['Cinzel'] text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#FFF8EC] shadow-[0_16px_34px_rgba(95,89,71,0.2)] transition hover:bg-[#6F7E5C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
								whileTap={
									saveStatus !== 'saving'
										? { scale: 0.98 }
										: undefined
								}
							>
								{saveStatus === 'saving'
									? 'Guardando...'
									: invitation.rsvpStatus !==
										  'pending'
										? 'Actualizar asistencia'
										: 'Confirmar asistencia'}
							</motion.button>

							<p className="mx-auto mt-3 max-w-[330px] text-[0.68rem] italic leading-5 text-[#8A806D]">
								Podrás modificar tu respuesta más
								adelante desde este mismo enlace.
							</p>
						</>
					) : (
						<>
							{invitation.message.trim() && (
								<div className="mx-auto mt-9 max-w-[300px]">
									<p className="font-['Allura'] text-[2.2rem] leading-none text-[#A98445]">
										Tu mensaje
									</p>

									<p className="mt-4 text-[0.78rem] italic leading-6 text-[#6D6654]">
										“{invitation.message}”
									</p>
								</div>
							)}

							<p className="mx-auto mt-7 max-w-[300px] text-[0.68rem] italic leading-5 text-[#8A806D]">
								Esta información corresponde a la última
								confirmación registrada.
							</p>
						</>
					)}
				</form>
			</motion.div>
		</section>
	);
}
