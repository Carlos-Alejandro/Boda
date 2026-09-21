/** Rect and viewport offsets are both in layout-viewport coordinates. */
export function editorScrollCorrection(bottom: number, viewportHeight: number,
	visualViewport?: { height: number; offsetTop: number } | null) {
	const visibleBottom = visualViewport ? visualViewport.offsetTop + visualViewport.height : viewportHeight;
	// Leave an already visible input alone, even when it is close to the edge.
	return bottom > visibleBottom ? bottom - visibleBottom + 16 : 0;
}
