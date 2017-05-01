const express = require('express');
const Mal = require('./mal');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' });
});

router.post('/mal/search/:title', (req, res) => {
  Mal.search(
    { username: req.body.username, password: req.body.password },
    req.params.title,
  )
  .then((results) => {
    console.log('/mal/search/:title', results);
    res.status(200).json(results);
  })
  .catch(err => res.status(200).json({ error: err }));
});

router.post('/mal/add', (req, res) => {
  Mal.add(
    { username: req.body.username, password: req.body.password },
    req.body.id,
    req.body.xml,
  )
  .then((results) => {
    res.status(200).json(results);
  })
  .catch(err => res.status(200).json({ error: err }));
});

module.exports = router;
