const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const pug = require('pug');
const router = require('./routes');
require('dotenv').config();

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

const app = express();
mongoose.Promise = global.Promise;

app.use(compression({ level: 9, threshold: 0 }));
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Accept, Origin, Content-Type, Referer',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : 'No body'}`);
  next();
});
app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(router);

// Handle errors
app.use((err, req, res) => {
  console.log('Error handler', err);
  const stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.json({ error: errorDetails });
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails), // Ajax call, send JSON back
  });
});

mongoose.connect(process.env.MONGODB_URL, (err) => {
  if (err) throw new Error(err);
  app.listen(4000);
  console.log('Server now listening on port 4000');
});
