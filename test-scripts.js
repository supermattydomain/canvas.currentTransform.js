ENABLE_ASSERTIONS = true;

(function($) {
	/**
	 * Transform the given (x,y) point by the given affine transformation matrix.
	 * Array members are expected to be in the order used by the Canvas 2D context/SVGMatrix, so that:
	 * Identity:    [  1  0  0  1  0  0 ]
	 * Translation: [  1  0  0  1 tx ty ]
	 * Scaling:     [ sx  0  0 sy  0  0 ]
	 * Rotation:    [ +c +s -s +c  0  0 ] (where c=cos, s=sin)
	 */
	function applyMatrix(x, y, m) {
		return [
			m[0] * x + m[1] * y + m[4],
			m[2] * x + m[3] * y + m[5]
		];
	}
	$(function() {
		var
			canvas = $('#theCanvas'),
			context = canvas[0].getContext("2d"),
			identityMatrix = [1, 0, 0, 1, 0, 0],
			point,
			m,
			top = -30,
			left = -30,
			width = 20,
			height = 20;

		// 1. Test transform functions and save/restore
		context.fillStyle = "rgb(128,128,255)";
		context.fillRect(canvas.width() / 4, canvas.height() / 4, canvas.width() / 2, canvas.height() / 2);
		// All four of these do nothing except exercise the API.
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.resetTransform();
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.setTransform.apply(context, identityMatrix);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.transform.apply(context, identityMatrix);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.currentTransform = identityMatrix;
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);
		debug("Saving transform matrix");
		context.save();
		debug("Scaling by factor of two");
		context.scale(2, 2);
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);
		debug("Restoring transform matrix");
		context.restore();
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);

		// 2. Show that performing transforms via the canvas, and manually using the retrieved transform matrix,
		// yield the same results. The two objects drawn should be congruent (but this is not verified programmatically).
		// If any red pixels are visible, bugs or rounding errors (or both) have occurred.
		// 2a. Draw object by transforming canvas
		context.fillStyle = "rgb(255,0,0)";
		context.save();
		// debug('At start: ', context.currentTransform);
		context.translate(canvas.width() / 2, canvas.height() / 2);
		// debug('After translate: ', context.currentTransform);
		context.rotate(Math.PI / 4);
		// debug('After rotate: ', context.currentTransform);
		// context.scale(2, 3);
		// debug('After scale: ', context.currentTransform);
		if (true) {
			context.fillRect(left, top, width, height);
		}
		m = context.currentTransform;
		context.restore();
		// 2b. Draw same object in different colour by manually transforming co-ordinates using saved matrix from 2a
		context.fillStyle = "rgb(0,255,0)";
		debug('Saved transform: ', m);
		if (true) {
			// This would draw the rectangle untransformed
			// context.fillRect(point[0], point[1], width, height);
			// This draws the rectangle transformed by the matrix
			context.beginPath();
			point = applyMatrix(left, top, m);
			context.moveTo(point[0], point[1]);
			point = applyMatrix(left + width, top, m);
			context.lineTo(point[0], point[1]);
			point = applyMatrix(left + width, top + height, m);
			context.lineTo(point[0], point[1]);
			point = applyMatrix(left, top + height, m);
			context.lineTo(point[0], point[1]);
			context.closePath();
			context.fill();
		}
	});
})(jQuery);
