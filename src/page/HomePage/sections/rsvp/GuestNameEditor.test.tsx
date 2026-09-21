import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GuestNameEditor } from './GuestNameEditor';
import { GuestAttendanceRow } from './GuestAttendanceRow';

type ElementProps = {
	children?: ReactNode;
	onClick?: () => void;
	className?: string;
	onChange?: (event: { target: { value: string } }) => void;
};

function findElement(tree: ReactNode, predicate: (element: ReactElement<ElementProps>) => boolean): ReactElement<ElementProps> | undefined {
	for (const child of Children.toArray(tree)) {
		if (!isValidElement<ElementProps>(child)) continue;
		if (predicate(child)) return child;
		const found = findElement(child.props.children, predicate);
		if (found) return found;
	}
}

describe('replacement editor cancellation', () => {
	it('restores through the existing callback and renders the complete original name', () => {
		const original = 'Cassandra Us Hernandez María Alejandra de los Ángeles';
		const guest = { name: 'Mariana', originalName: original, shortName: 'Mariana', type: 'replacement' as const, attending: true };
		const onRestore = vi.fn();
		const onClear = vi.fn();
		const onSelect = vi.fn();
		let tree: ReactNode;
		function Harness() {
			tree = GuestAttendanceRow({ id: 'guest', guest, position: 1, response: false, name: 'Mariana',
				replacementsAllowed: true, editable: true, expanded: false, error: null,
				onExpand: vi.fn(), onSelect, onName: vi.fn(), onClear, onRestore });
			return tree;
		}
		const html = renderToStaticMarkup(<Harness />);
		expect(html).toContain('Restaurar invitado original');
		expect(html).toContain(`En lugar de ${original}</p>`);
		expect(html.split(original)).toHaveLength(2);
		expect(html).not.toContain('rsvp-restore-name');
		expect(html).not.toContain('Retirar reemplazo');
		const restore = findElement(tree, element => element.props.className === 'rsvp-action rsvp-restore');
		vi.stubGlobal('requestAnimationFrame', vi.fn());
		try { restore!.props.onClick!(); } finally { vi.unstubAllGlobals(); }
		expect(onRestore).toHaveBeenCalledTimes(1);
		expect(onRestore).toHaveBeenCalledWith();
		expect(onClear).not.toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		expect(guest).toEqual({ name: 'Mariana', originalName: original, shortName: 'Mariana', type: 'replacement', attending: true });
	});
	it.each(['Carlitos 2', '  Mariana López  ', ''])('restores the opening draft name %j and closes without submitting', openingName => {
		const draft = { name: openingName, message: 'Nos vemos', attending: false };
		const onChange = vi.fn((name: string) => { draft.name = name; });
		const onDone = vi.fn();
		let tree: ReactNode;
		// Render with real React hooks and exercise the emitted handlers; no DOM or Firebase.
		function Harness() {
			tree = GuestNameEditor({ id: 'editor', value: openingName, isReplacement: true, invalid: false, onChange, onDone });
			return tree;
		}
		renderToStaticMarkup(<Harness />);
		const input = findElement(tree, element => element.type === 'input');
		const cancel = findElement(tree, element => element.type === 'button' && element.props.children === 'Cancelar');
		expect(input).toBeDefined();
		expect(cancel).toBeDefined();
		input!.props.onChange!({ target: { value: 'Otro nombre' } });
		input!.props.onChange!({ target: { value: 'A' } });
		expect(draft.name).toBe('A');
		cancel!.props.onClick!();
		expect(draft).toEqual({ name: openingName, message: 'Nos vemos', attending: false });
		expect(onChange).toHaveBeenLastCalledWith(openingName);
		expect(onDone).toHaveBeenCalledTimes(1);
	});
});
