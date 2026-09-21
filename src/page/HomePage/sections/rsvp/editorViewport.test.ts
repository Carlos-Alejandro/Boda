import { describe, expect, it } from 'vitest';
import { editorScrollCorrection } from './editorViewport';

describe('editor visibility correction', () => {
	const viewport = { height: 400, offsetTop: 50 };
	it('leaves fully visible inputs alone, including near the bottom edge', () => {
		expect(editorScrollCorrection(449, 800, viewport)).toBe(0);
	});
	it('corrects only the hidden bottom plus a small keyboard margin', () => {
		expect(editorScrollCorrection(490, 800, viewport)).toBe(56);
	});
	it('does not move upward for an input near the top', () => {
		expect(editorScrollCorrection(90, 800, viewport)).toBe(0);
	});
	it('uses the normal available viewport without VisualViewport', () => {
		expect(editorScrollCorrection(300, 400)).toBe(0);
		expect(editorScrollCorrection(440, 400, null)).toBe(56);
	});
	it('does not move again after the correction', () => {
		const delta = editorScrollCorrection(490, 800, viewport);
		expect(editorScrollCorrection(490 - delta, 800, viewport)).toBe(0);
	});
});
