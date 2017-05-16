const express = require('express');
const passport = require('passport');
const malController = require('../controllers/mal');
const matchController = require('../controllers/match');

const router = express.Router();

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
    res.redirect('/admin');
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
// Render admin console
router.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
    matchController.get().then((data) => {
      res.render('admin', { data });
    });
  } else res.render('login');
});

router.post('/mal/test', catchErrors(malController.test));

module.exports = router;
