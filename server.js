const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const router = require('./routes');
const errorHandlers = require('./handlers/errors');
require('dotenv').config();

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const app = express();
let server;

app.use(compression({ level: 9, threshold: 0 }));
app.use(cors({
  origin: `${process.env.CORS_ORIGIN || '*'}`,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Accept, Origin, Content-Type, Referer',
  credentials: true,
}));

app.use(express.static('public'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.info(`${req.method} ${req.url} ${Date.now()}`);
  next();
});

app.use(router);

// Handle errors
app.use(errorHandlers.notFound);
if (process.env.NODE_ENV === 'development') app.use(errorHandlers.developmentErrors);
app.use(errorHandlers.productionErrors);


const runServer = (port = process.env.PORT || 80) =>
  new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Server now listening on port ${port}`);
      resolve();
    });
  });

const closeServer = () =>
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      resolve();
    });
  });

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
