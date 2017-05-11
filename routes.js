const express = require('express');
const malController = require('./controllers/mal');
const matchController = require('./controllers/match');

const router = express.Router();

// Wrapper to catch errors for async/await middlewares
const catchErrors = fn =>
  (req, res, next) =>
    fn(req, res, next).catch(next);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' });
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
router.post('/match/commit', catchErrors(matchController.commit));
// Delete a match
router.post('/match/delete', catchErrors(matchController.delete));

module.exports = router;
