const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const router = require('./routes');

const app = express();
require('dotenv').config();

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
  console.info(`${req.method} ${req.url} ${req.body ? JSON.stringify(req.body) : ''}`);
  next();
});
app.use(router);

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
  app.listen(4000);
  console.log('Server now listening on port 4000');
})
.catch(err => new Error(err));
