import { describe, expect, it } from 'vitest';

import type { Guest } from '../../../firebase/InvitationContext';
import {
	buildUpdatedGuests,
	calculateRsvpStatus,
} from './rsvpLogic';

describe('calculateRsvpStatus', () => {
	it('calcula confirmed', () => {
		const guests: Guest[] = [
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: true,
			},
		];

		expect(calculateRsvpStatus(guests)).toBe('confirmed');
	});

	it('calcula partial', () => {
		const guests: Guest[] = [
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: true,
			},
			{
				name: 'María Pérez',
				shortName: 'María',
				type: 'known',
				attending: false,
			},
		];

		expect(calculateRsvpStatus(guests)).toBe('partial');
	});

	it('calcula declined', () => {
		const guests: Guest[] = [
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: false,
			},
		];

		expect(calculateRsvpStatus(guests)).toBe('declined');
	});
});

describe('buildUpdatedGuests', () => {
	it('restaura originalName cuando un replacement vuelve a Sí', () => {
		const guests: Guest[] = [
			{
				name: 'Laura Gómez',
				shortName: 'Laura',
				type: 'replacement',
				attending: true,
				originalName: 'Carlos Pérez',
			},
		];

		expect(
			buildUpdatedGuests(
				guests,
				true,
				[true],
				[''],
				[''],
			),
		).toEqual([
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: true,
			},
		]);
	});

	it('convierte un known que responde No en replacement', () => {
		const guests: Guest[] = [
			{
				name: 'Carlos Pérez',
				shortName: 'Carlos',
				type: 'known',
				attending: null,
			},
		];

		expect(
			buildUpdatedGuests(
				guests,
				true,
				[false],
				['  Laura Gómez  '],
				[''],
			),
		).toEqual([
			{
				name: 'Laura Gómez',
				shortName: 'Laura',
				type: 'replacement',
				attending: true,
				originalName: 'Carlos Pérez',
			},
		]);
	});

	it('confirma un open con nombre', () => {
		const guests: Guest[] = [
			{
				name: '',
				shortName: 'Acompañante',
				type: 'open',
				attending: false,
			},
		];

		expect(
			buildUpdatedGuests(
				guests,
				true,
				[null],
				[''],
				['  María López  '],
			),
		).toEqual([
			{
				name: 'María López',
				shortName: 'María',
				type: 'open',
				attending: true,
			},
		]);
	});

	it('mantiene un open vacío como no asistente', () => {
		const guests: Guest[] = [
			{
				name: '',
				shortName: 'Acompañante',
				type: 'open',
				attending: false,
			},
		];

		expect(
			buildUpdatedGuests(
				guests,
				true,
				[null],
				[''],
				['   '],
			),
		).toEqual([
			{
				name: '',
				shortName: 'Acompañante',
				type: 'open',
				attending: false,
			},
		]);
	});
});
