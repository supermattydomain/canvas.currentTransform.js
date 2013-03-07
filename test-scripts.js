(function($) {
	$(function() {
		var canvas = $('#theCanvas'), context = canvas[0].getContext("2d");
		context.fillStyle = "rgb(128,128,255)";
		context.fillRect(canvas.width() / 4, canvas.height() / 4, canvas.width() / 2, canvas.height() / 2);
		debug('Current transform: ', context.mozCurrentTransform);
		debug('Current transform inverse: ', context.mozCurrentTransformInverse);
		debug("Saving transform matrix");
		context.save();
		debug("Scaling by factor of two");
		context.scale(2, 2);
		debug('Current transform: ', context.mozCurrentTransform);
		debug('Current transform inverse: ', context.mozCurrentTransformInverse);
		debug("Restoring transform matrix");
		context.restore();
		debug('Current transform: ', context.mozCurrentTransform);
		debug('Current transform inverse: ', context.mozCurrentTransformInverse);
	});
})(jQuery);
