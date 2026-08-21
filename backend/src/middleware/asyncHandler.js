// Wraps an async route handler so a thrown/rejected error is passed to
// Express's error handler instead of crashing the whole process. Node
// terminates the process on an unhandled promise rejection by default,
// which is exactly what was happening before this existed — any hiccup
// in an admin route (a flaky FPL API response, a bad gameweek number,
// etc.) took the entire backend down instead of just failing that one
// request.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
