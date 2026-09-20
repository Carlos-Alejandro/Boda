import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GuestNameEditor } from './GuestNameEditor';

type ElementProps = {
	children?: ReactNode;
	onClick?: () => void;
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
