// utils/catchAsync.js

// Wrap async route handlers to automatically catch errors
// and forward them to globalErrorHandler
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};
