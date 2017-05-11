const express = require('express');
const passport = require('passport');
const malController = require('../controllers/mal');
const matchController = require('../controllers/match');

const router = express.Router();
router.use(require('./passport'));

// Wrapper to catch errors for async/await middlewares
const catchErrors = fn =>
  (req, res, next) =>
    fn(req, res, next).catch(next);

/* eslint-disable consistent-return */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({ message: 'Not authenticated.' }).end();
};

router.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' });
});

router.post('/login',
  passport.authenticate('local'),
  (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.status(200).json({ message: 'Login successful', user: req.user.username });
  });

router.get('/logout', isAuthenticated, (req, res) => {
  req.logout();
  res.json({ logoutSuccess: true }); // .redirect('/nowhere');
});

// Add an anime to MAL account
router.post('/mal/add', catchErrors(malController.add));
// Check MAL credentials
router.post('/mal/check', catchErrors(malController.check));
// Search for a title on MAL
router.post('/mal/search', catchErrors(malController.search));
// Add a match candidate for review
router.post('/match/add', catchErrors(matchController.add));
// Commit a match to database
router.post('/match/commit', isAuthenticated, catchErrors(matchController.commit));
// Delete a match
router.post('/match/delete', isAuthenticated, catchErrors(matchController.delete));
// Get current matches for review
router.get('/match', isAuthenticated, catchErrors(matchController.get));

module.exports = router;
