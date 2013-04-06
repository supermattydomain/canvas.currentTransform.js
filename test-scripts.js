// TODO: Use QUnit.

ENABLE_ASSERTIONS = true;

(function($) {
	$(function() {
		var
			canvas = $('#theCanvas'),
			context = canvas[0].getContext("2d"),
			identityMatrix = [1, 0, 0, 1, 0, 0],
			someOtherMatrix = [1, 2, 3, 4, 5, 6],
			point,
			m,
			top = -20,
			left = -30,
			width = 40,
			height = 50;

		// 1. Test transform functions and save/restore
		// The following four do nothing except exercise the API.
		// 1.1 resetTransform sets the CTM to the identity matrix.
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.setTransform.apply(context, someOtherMatrix);
		assert(function() { return context.currentTransform.equalsDeep(someOtherMatrix); });
		context.resetTransform();
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		// 1.2 setTransform over-writes the CTM with the supplied matrix.
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.setTransform.apply(context, someOtherMatrix);
		assert(function() { return context.currentTransform.equalsDeep(someOtherMatrix); });
		context.setTransform.apply(context, identityMatrix);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		// 1.3 transform multiplies the CTM by the given matrix
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.setTransform.apply(context, someOtherMatrix);
		assert(function() { return context.currentTransform.equalsDeep(someOtherMatrix); });
		context.setTransform.apply(context, identityMatrix);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.transform.apply(context, identityMatrix);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		// 1.4 Assigning to currentTransform over-writes the CTM with the supplied matrix.
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		context.setTransform.apply(context, someOtherMatrix);
		assert(function() { return context.currentTransform.equalsDeep(someOtherMatrix); });
		context.currentTransform = identityMatrix;
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		// 1.5 save and restore push/pop the CTM onto/from a stack of transformation matrices.
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		assert(function() { return context.currentTransformInverse.equalsDeep(identityMatrix); });
		debug("Saving transform matrix");
		context.save();
		debug("Scaling by factor of two");
		context.scale(2, 2);
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);
		assert(function() { return context.currentTransform.equalsDeep([2, 0, 0, 2, 0, 0]); });
		assert(function() { return context.currentTransformInverse.equalsDeep([0.5, 0, 0, 0.5, 0, 0]); });
		debug("Restoring transform matrix");
		context.restore();
		debug('Current transform: ', context.currentTransform);
		debug('Current transform inverse: ', context.currentTransformInverse);
		assert(function() { return context.currentTransform.equalsDeep(identityMatrix); });
		assert(function() { return context.currentTransformInverse.equalsDeep(identityMatrix); });

		// 2. Show that performing transforms via the canvas, and manually using the retrieved transform matrix,
		// yield the same results.
		// The red border should exactly surround the green filled area.
		// If this is not the case, bugs (or rounding errors) have occurred.

		// 2a. Draw object by transforming canvas
		context.save();
		// debug('At start: ', context.currentTransform);
		context.translate(canvas.width() / 2, canvas.height() / 2);
		// debug('After translate: ', context.currentTransform);
		context.rotate(Math.PI / 16);
		// debug('After rotate: ', context.currentTransform);
		context.scale(2, 3);
		// debug('After scale: ', context.currentTransform);
		context.strokeStyle = "rgb(255,0,0)";
		context.strokeRect(left, top, width, height);
		// Save the transformation matrix for later use
		m = context.currentTransform;
		context.restore();

		// 2b. Draw same object in different colour by manually transforming
		// co-ordinates using saved matrix from 2a
		context.fillStyle = "rgb(0,255,0)";
		debug('Saved transform: ', m);
		// This would draw the rectangle untransformed
		// context.fillRect(point[0], point[1], width, height);
		// This draws the rectangle transformed by the matrix
		context.beginPath();
		point = transformPoint(left, top, m);
		context.moveTo(point[0], point[1]);
		point = transformPoint(left + width, top, m);
		context.lineTo(point[0], point[1]);
		point = transformPoint(left + width, top + height, m);
		context.lineTo(point[0], point[1]);
		point = transformPoint(left, top + height, m);
		context.lineTo(point[0], point[1]);
		context.closePath();
		context.fill();
	});
})(jQuery);
