/* eslint-disable no-param-reassign */

// Adapted from Wes Bos's Learn-Node course

// Wrapped around async middleware to pass errors to the next middleware
// Adapted from https://github.com/madole/async-error-catcher
exports.catchErrors = fn =>
  (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (!routePromise.catch) return;
    routePromise.catch(err => next(err));
  };

exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

exports.developmentErrors = (err, req, res) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails), // Ajax call, send JSON back
  });
};

// Do not leak stack trace to user in production
exports.productionErrors = (err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
};
