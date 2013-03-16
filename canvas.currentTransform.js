(function() {
	var canvas = document.createElement('canvas'),
		context = canvas.getContext("2d"),
		canvasProto,
		contextProto,
		needPolyfill,
		needPolyfillInverse,
		originalGetContext, originalSave, originalRestore, originalRotate,
		originalScale, originalTranslate, originalTransform;
	if (Object.getPrototypeOf) {
		canvasProto = Object.getPrototypeOf(canvas);
		contextProto = Object.getPrototypeOf(context);
	} else {
		canvasProto = canvas.__proto__ || canvas.constructor.prototype || HTMLCanvasElement;
		contextProto = context.__proto__ || context.constructor.prototype || CanvasRenderingContext2D;
	}
	needPolyfill = !('mozCurrentTransform' in contextProto);
	needPolyfillInverse = !('mozCurrentTransformInverse' in contextProto);
	if (needPolyfill || needPolyfillInverse) {
		// Saved values of over-ridden Canvas methods
		originalGetContext = canvasProto.getContext;
		// Saved values of over-ridden Context methods
		originalSave      = contextProto.save;
		originalRestore   = contextProto.restore;
		originalRotate    = contextProto.rotate;
		originalScale     = contextProto.scale;
		originalTranslate = contextProto.translate;
		originalTransform = contextProto.transform;
		// Over-ride the Canvas factory method that creates Contexts
		canvasProto.getContext = function() {
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
	}
	if (needPolyfill) {
		Object.defineProperty(contextProto, 'mozCurrentTransform', {
			get: function getCurrentTransform() {
				return this._transformMatrix;
			},
			configurable: false,
			enumerable: false
		});
	}
	if (needPolyfillInverse) {
		Object.defineProperty(contextProto, 'mozCurrentTransformInverse', {
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