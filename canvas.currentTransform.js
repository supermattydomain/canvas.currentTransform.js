(function() {
	var identityMatrix = [1, 0, 0, 1, 0, 0],
		canvas = document.createElement('canvas'),
		context = canvas.getContext("2d"),
		canvasProto,
		contextProto,
		originalGetContext, originalSave, originalRestore, originalRotate,
		originalScale, originalTranslate, originalTransform;
	if (Object.getPrototypeOf) {
		canvasProto = Object.getPrototypeOf(canvas);
		contextProto = Object.getPrototypeOf(context);
	} else {
		canvasProto = canvas.constructor.prototype || canvas.__proto__ || HTMLCanvasElement;
		contextProto = context.constructor.prototype || context.__proto__ || CanvasRenderingContext2D;
	}
	// If the browser has prefixed mozCurrentTransform[Inverse] properties, add renamed non-prefixed properties mirroring them.
	if (!('currentTransform' in contextProto) && ('mozCurrentTransform' in contextProto)) {
		Object.defineProperty(contextProto, 'currentTransform', {
			get: function() {
				return this.mozCurrentTransform;
			},
			set: function(newMatrix) {
				this.mozCurrentTransform = newMatrix;
				return newMatrix;
			},
			configurable: false,
			enumerable: false
		});
	}
	// Separate polyfills for potentially missing Canvas context methods
	if (!('resetTransform' in contextProto)) {
		contextProto.resetTransform = function() {
			this.setTransform.apply(this, identityMatrix);
		};
	}
	if (!('currentTransformInverse' in contextProto) && ('mozCurrentTransformInverse' in contextProto)) {
		Object.defineProperty(contextProto, 'currentTransformInverse', {
			get: function() {
				return this.mozCurrentTransformInverse;
			},
			// No setter for inverse matrix
			configurable: false,
			enumerable: false
		});
	}
	// If we still don't have currentTransform[Inverse] properties, we need to track the CTM ourselves.
	if (!('currentTransform' in contextProto) || !('currentTransformInverse' in contextProto)) {
		// Saved values of over-ridden Canvas methods
		originalGetContext = canvasProto.getContext;
		// Saved values of over-ridden Context methods
		originalSave      = contextProto.save;
		originalRestore   = contextProto.restore;
		originalRotate    = contextProto.rotate;
		originalScale     = contextProto.scale;
		originalTranslate = contextProto.translate;
		originalTransform = contextProto.transform;
		originalSetTransform = context.setTransform;
		originalResetTransform = contextProto.resetTransform;
		// Over-ride the Canvas factory method that creates Contexts to create decorated ones
		canvasProto.getContext = function() {
			// Workaround: older browsers do not accept 'arguments' as second parameter of Function.apply
			var context = originalGetContext.apply(this, Array.prototype.slice.call(arguments));
			// Using Object.defineProperty rather than simple assignment in order to hide these 'private' data
			Object.defineProperty(context, '_transformMatrix', {
				configurable: false,
				enumerable: false,
				value: identityMatrix,
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
		contextProto.save = function() {
			this._transformStack.push(this._transformMatrix.concat()); // shallow copy
			return originalSave.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.restore = function() {
			var mtx = this._transformStack.pop();
			if (mtx) {
				this._transformMatrix = mtx;
			}
			return originalRestore.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.translate = function(x, y) {
			this._transformMatrix[4] += this._transformMatrix[0] * x + this._transformMatrix[2] * y;
			this._transformMatrix[5] += this._transformMatrix[1] * x + this._transformMatrix[3] * y;
			return originalTranslate.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.scale = function(x, y) {
			this._transformMatrix[0] *= x;
			this._transformMatrix[1] *= x;
			this._transformMatrix[2] *= y;
			this._transformMatrix[3] *= y;
			return originalScale.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.rotate = function(angle) {
			var c = Math.cos(angle), s = Math.sin(angle);
			this._transformMatrix = [
				this._transformMatrix[0] *  c + this._transformMatrix[2] * s,
				this._transformMatrix[1] *  c + this._transformMatrix[3] * s,
				this._transformMatrix[0] * -s + this._transformMatrix[2] * c,
				this._transformMatrix[1] * -s + this._transformMatrix[3] * c,
				this._transformMatrix[4],
				this._transformMatrix[5]
			];
			return originalRotate.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.transform = function(a, b, c, d, e, f) {
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
		contextProto.setTransform = function(a, b, c, d, e, f) {
			this._transformMatrix = [ a, b, c, d, e, f];
			return originalSetTransform.apply(this, Array.prototype.slice.call(arguments));
		};
		contextProto.resetTransform = function() {
			this._transformMatrix = identityMatrix;
			return originalResetTransform.apply(this, Array.prototype.slice.call(arguments));
		};
	}
	if (!('currentTransform' in contextProto)) {
		Object.defineProperty(contextProto, 'currentTransform', {
			get: function() {
				return this._transformMatrix;
			},
			configurable: false,
			enumerable: false
		});
	}
	if (!('currentTransformInverse' in contextProto)) {
		Object.defineProperty(contextProto, 'currentTransformInverse', {
			get: function() {
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
