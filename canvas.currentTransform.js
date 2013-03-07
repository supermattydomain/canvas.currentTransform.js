(function() {
	var canvas = document.createElement('canvas'),
		context = canvas.getContext("2d"),
		needPolyfill = !('mozCurrentTransform' in context.__proto__),
		needPolyfillInverse = !('mozCurrentTransformInverse' in context.__proto__),
		originalGetContext, originalSave, originalRestore, originalRotate,
		originalScale, originalTranslate, originalTransform;
	if (needPolyfill || needPolyfillInverse) {
		// Saved values of over-ridden Canvas methods
		originalGetContext = canvas.__proto__.getContext;
		// Saved values of over-ridden Context methods
		originalSave      = context.__proto__.save;
		originalRestore   = context.__proto__.restore;
		originalRotate    = context.__proto__.rotate;
		originalScale     = context.__proto__.scale;
		originalTranslate = context.__proto__.translate;
		originalTransform = context.__proto__.transform;
		// Over-ride the Canvas factory method that creates Contexts
		canvas.__proto__.getContext = function() {
			// Workaround: older browsers do not accept 'arguments' as second parameter of Function.apply
			var context = originalGetContext.apply(this, Array.prototype.slice.call(arguments));
			// Using Object.defineProperty rather than simple assignment in order to hide these 'private' data
			Object.defineProperty(context, '_transformMatrix', {
				configurable: false,
				enumerable: false,
				value: [1, 0, 0, 1, 0, 0],
				writable: true
			});
			Object.defineProperty(context, '_transformStack', {
				configurable: false,
				enumerable: false,
				value: [],
				writable: true
			});
			return context;
		};
		// Over-ride each Context method that modifies the transform matrix
		context.__proto__.save = function() {
			this._transformStack.push(this._transformMatrix.concat()); // shallow copy
			return originalSave.apply(this, Array.prototype.slice.call(arguments));
		};
		context.__proto__.restore = function() {
			var mtx = this._transformStack.pop();
			if (mtx) {
				this._transformMatrix = mtx;
			}
			return originalRestore.apply(this, Array.prototype.slice.call(arguments));
		};
		context.__proto__.translate = function(x, y) {
			this._transformMatrix[4] += this._transformMatrix[0] * x + this._transformMatrix[2] * y;
			this._transformMatrix[5] += this._transformMatrix[1] * x + this._transformMatrix[3] * y;
			return originalTranslate.apply(this, Array.prototype.slice.call(arguments));
		};
		context.__proto__.scale = function(x, y) {
			this._transformMatrix[0] *= x;
			this._transformMatrix[1] *= x;
			this._transformMatrix[2] *= y;
			this._transformMatrix[3] *= y;
			return originalScale.apply(this, Array.prototype.slice.call(arguments));
		};
		context.__proto__.transform = function(a, b, c, d, e, f) {
			this._transformMatrix = [
				this._transformMatrix[0] * a + this._transformMatrix[2] * b,
				this._transformMatrix[1] * a + this._transformMatrix[3] * b,
				this._transformMatrix[0] * c + this._transformMatrix[2] * d,
				this._transformMatrix[1] * c + this._transformMatrix[3] * d,
				this._transformMatrix[0] * e + this._transformMatrix[2] * f + this._transformMatrix[4],
				this._transformMatrix[1] * e + this._transformMatrix[3] * f + this._transformMatrix[5]
			];
			return originalTransform.apply(this, Array.prototype.slice.call(arguments));
		};
		context.__proto__.rotate = function(angle) {
			var c = Math.cos(angle), s = Math.sin(angle);
			this._transformMatrix = [
				this._transformMatrix[0] * c + this._transformMatrix[2] * s,
				this._transformMatrix[1] * c + this._transformMatrix[3] * s,
				this._transformMatrix[0] * -s + this._transformMatrix[2] * c,
				this._transformMatrix[1] * -s + this._transformMatrix[3] * c,
				this._transformMatrix[4],
				this._transformMatrix[5]
			];
			return originalRotate.apply(this, Array.prototype.slice.call(arguments));
		};
	}
	if (needPolyfill) {
		Object.defineProperty(context.__proto__, 'mozCurrentTransform', {
			get: function getCurrentTransform() {
				return this._transformMatrix;
			},
			configurable: false,
			enumerable: false
		});
	}
	if (needPolyfillInverse) {
		Object.defineProperty(context.__proto__, 'mozCurrentTransformInverse', {
			get: function getCurrentTransformInverse() {
				var a = this._transformMatrix[0], b = this._transformMatrix[1],
					c = this._transformMatrix[2], d = this._transformMatrix[3],
					e = this._transformMatrix[4], f = this._transformMatrix[5],
					ad_minus_bc = a * d - b * c,
					bc_minus_ad = b * c - a * d;
				return [
					d / ad_minus_bc, b / bc_minus_ad,
					c / bc_minus_ad, a / ad_minus_bc,
					(d * e - c * f) / bc_minus_ad, (b * e - a * f) / ad_minus_bc
				];
			},
			configurable: false,
			enumerable: false
		});
	}
})();
