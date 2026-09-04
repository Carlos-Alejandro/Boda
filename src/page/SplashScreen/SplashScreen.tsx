import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';

import { useWeddingAudio } from '../../audio/WeddingAudioContext';
import { db } from '../../firebase/firebase';
import { InvitationUnavailable } from '../InvitationPage/InvitationUnavailable';
import { loadPublicInvitation } from '../InvitationPage/loadPublicInvitation';
import frameImage from '../../assets/splash/frame.png';
import lettersImage from '../../assets/splash/letters.png';
import namesImage from '../../assets/splash/names.png';
import florUpImage from '../../assets/splash/flor-up.png';
import florDownImage from '../../assets/splash/flor-down.png';
import heroImage from '../../assets/hero/hero-main2.jpeg';

import './SplashScreen.css';

type NavigatorWithConnection = Navigator & {
	connection?: {
		saveData?: boolean;
	};
};

type WindowWithIdleCallback = Window & {
	requestIdleCallback?: (
		callback: () => void,
		options?: { timeout: number },
	) => number;
	cancelIdleCallback?: (handle: number) => void;
};

function preloadImages(images: string[]) {
	return Promise.all(
		images.map((src) => {
			return new Promise<void>((resolve) => {
				const img = new Image();

				img.onload = () => {
					if (typeof img.decode === 'function') {
						img.decode().catch(() => undefined).finally(resolve);
						return;
					}

					resolve();
				};

				img.onerror = () => resolve();
				img.src = src;
			});
		}),
	);
}

export function SplashScreen() {
	const navigate = useNavigate();
	const { id } = useParams();

	const { play, prepareAudio } = useWeddingAudio();

	const [isLeaving, setIsLeaving] = useState(false);
	const [canAnimate, setCanAnimate] = useState(false);
	const [invitationAccess, setInvitationAccess] = useState<
		'checking' | 'allowed' | 'unavailable'
	>(id ? 'checking' : 'allowed');

	useEffect(() => {
		if (!id) {
			setInvitationAccess('allowed');
			return;
		}

		let isMounted = true;
		const invitationRef = doc(db, 'invitations', id);
		loadPublicInvitation(() => getDoc(invitationRef))
			.then(() => {
				if (isMounted) setInvitationAccess('allowed');
			})
			.catch(() => {
				if (isMounted) setInvitationAccess('unavailable');
			});

		return () => {
			isMounted = false;
		};
	}, [id]);

	useEffect(() => {
		let isMounted = true;
		let idleCallbackId: number | undefined;
		let fallbackTimeoutId: number | undefined;

		const loadAssets = async () => {
			await preloadImages([
				frameImage,
				lettersImage,
				namesImage,
				florUpImage,
				florDownImage,
				heroImage,
			]);

			if (!isMounted) return;

			setCanAnimate(true);

			const connection = (navigator as NavigatorWithConnection).connection;
			if (connection?.saveData) return;

			const idleWindow = window as WindowWithIdleCallback;
			if (idleWindow.requestIdleCallback) {
				idleCallbackId = idleWindow.requestIdleCallback(prepareAudio, {
					timeout: 1000,
				});
				return;
			}

			fallbackTimeoutId = window.setTimeout(prepareAudio, 0);
		};

		void loadAssets();

		return () => {
			isMounted = false;

			const idleWindow = window as WindowWithIdleCallback;
			if (idleCallbackId !== undefined) {
				idleWindow.cancelIdleCallback?.(idleCallbackId);
			}
			if (fallbackTimeoutId !== undefined) {
				window.clearTimeout(fallbackTimeoutId);
			}
		};
	}, [prepareAudio]);

	const handleStart = () => {
		if (isLeaving || !canAnimate) return;

		void play();
		setIsLeaving(true);

		window.setTimeout(() => {
			if (id) {
				navigate(`/invitacion/${id}/inicio`, {
					replace: true,
				});

				return;
			}

			navigate('/inicio', {
				replace: true,
			});
		}, 750);
	};

	if (invitationAccess === 'checking') return null;
	if (invitationAccess === 'unavailable') {
		return <InvitationUnavailable />;
	}

	return (
		<section className="splash-screen">
			<motion.div
				className="splash-background"
				initial={{ opacity: 0 }}
				animate={
					!canAnimate
						? { opacity: 0 }
						: isLeaving
							? { opacity: 0 }
							: { opacity: 1 }
				}
				transition={{
					duration: isLeaving ? 0.75 : 1,
					ease: 'easeInOut',
				}}
			>
				<motion.img
					src={florUpImage}
					alt=""
					aria-hidden="true"
					className="splash-corner-flower splash-corner-flower-up"
					initial={{
						opacity: 0,
						x: 18,
						y: -18,
						scale: 0.96,
					}}
					animate={
						canAnimate
							? {
									opacity: 1,
									x: 0,
									y: 0,
									scale: 1,
								}
							: {
									opacity: 0,
									x: 18,
									y: -18,
									scale: 0.96,
								}
					}
					transition={{
						delay: 0.4,
						duration: 2,
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				<motion.img
					src={florDownImage}
					alt=""
					aria-hidden="true"
					className="splash-corner-flower splash-corner-flower-down"
					initial={{
						opacity: 0,
						x: -18,
						y: 18,
						scale: 0.96,
					}}
					animate={
						canAnimate
							? {
									opacity: 1,
									x: 0,
									y: 0,
									scale: 1,
								}
							: {
									opacity: 0,
									x: -18,
									y: 18,
									scale: 0.96,
								}
					}
					transition={{
						delay: 0.6,
						duration: 2,
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				<motion.div
					className="splash-light"
					initial={{
						opacity: 0,
						scale: 0.55,
					}}
					animate={
						canAnimate
							? {
									opacity: 1,
									scale: 1,
								}
							: {
									opacity: 0,
									scale: 0.55,
								}
					}
					transition={{
						duration: 2.4,
						ease: [0.22, 1, 0.36, 1],
					}}
				/>

				<motion.div
					className="splash-content"
					animate={
						!canAnimate
							? {
									opacity: 0,
									scale: 1,
									filter: 'blur(0px)',
								}
							: isLeaving
								? {
										opacity: 0,
										scale: 1.035,
										filter: 'blur(7px)',
									}
								: {
										opacity: 1,
										scale: 1,
										filter: 'blur(0px)',
									}
					}
					transition={{
						duration: isLeaving ? 0.75 : 1,
						ease: 'easeInOut',
					}}
				>
					<motion.div
						className="splash-logo-wrap"
						initial={{
							opacity: 0,
							y: 30,
							scale: 0.92,
						}}
						animate={
							canAnimate
								? {
										opacity: 1,
										y: 0,
										scale: 1,
									}
								: {
										opacity: 0,
										y: 30,
										scale: 0.92,
									}
						}
						transition={{
							delay: 0.45,
							duration: 1.8,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.div
							className="splash-logo-breath"
							animate={
								canAnimate
									? {
											y: [0, -4, 0],
											scale: [1, 1.01, 1],
										}
									: {
											y: 0,
											scale: 1,
										}
							}
							transition={{
								delay: 3,
								duration: 5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						>
							<div className="splash-logo-stack">
								<motion.img
									src={frameImage}
									alt=""
									aria-hidden="true"
									className="splash-logo-layer splash-logo-frame"
									initial={{
										opacity: 0,
										scale: 0.78,
										rotate: -7,
									}}
									animate={
										canAnimate
											? {
													opacity: 1,
													scale: 1,
													rotate: 0,
												}
											: {
													opacity: 0,
													scale: 0.78,
													rotate: -7,
												}
									}
									transition={{
										delay: 0.75,
										duration: 2,
										ease: [0.22, 1, 0.36, 1],
									}}
								/>

								<motion.img
									src={lettersImage}
									alt="Monograma Alejandro y América"
									className="splash-logo-layer splash-logo-letters"
									initial={{
										opacity: 0,
										scale: 0.88,
										y: 18,
									}}
									animate={
										canAnimate
											? {
													opacity: 1,
													scale: 1,
													y: 0,
												}
											: {
													opacity: 0,
													scale: 0.88,
													y: 18,
												}
									}
									transition={{
										delay: 1.45,
										duration: 1.7,
										ease: [0.22, 1, 0.36, 1],
									}}
								/>

								<motion.img
									src={namesImage}
									alt=""
									aria-hidden="true"
									className="splash-logo-layer splash-logo-names"
									initial={{
										opacity: 0,
										y: 14,
										scale: 0.98,
									}}
									animate={
										canAnimate
											? {
													opacity: 1,
													y: 0,
													scale: 1,
												}
											: {
													opacity: 0,
													y: 14,
													scale: 0.98,
												}
									}
									transition={{
										delay: 2.2,
										duration: 1.5,
										ease: [0.22, 1, 0.36, 1],
									}}
								/>
							</div>
						</motion.div>
					</motion.div>

					<motion.div
						className="splash-copy"
						initial={{
							opacity: 0,
							y: 18,
						}}
						animate={
							canAnimate
								? {
										opacity: 1,
										y: 0,
									}
								: {
										opacity: 0,
										y: 18,
									}
						}
						transition={{
							delay: 3.15,
							duration: 1.2,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.button
							type="button"
							disabled={isLeaving || !canAnimate}
							className="rounded-full border border-[#A98445]/55 bg-white/30 px-4 py-2 font-['Cinzel'] text-[0.68rem] font-medium uppercase tracking-[0.32em] text-[#A98445] shadow-[0_14px_34px_rgba(111,90,58,0.08)] backdrop-blur-sm disabled:pointer-events-none disabled:opacity-70"
							initial={{
								letterSpacing: '0.48em',
								opacity: 0,
								y: 8,
							}}
							animate={
								canAnimate
									? {
											letterSpacing: '0.32em',
											opacity: 1,
											y: 0,
										}
									: {
											letterSpacing: '0.48em',
											opacity: 0,
											y: 8,
										}
							}
							transition={{
								delay: 3.25,
								duration: 1.25,
								ease: 'easeOut',
							}}
							onClick={handleStart}
						>
							Comenzar
						</motion.button>
					</motion.div>
				</motion.div>
			</motion.div>
		</section>
	);
}
