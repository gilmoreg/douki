const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const router = require('./routes');

const app = express();

app.use(compression({ level: 9, threshold: 0 }));
app.use(cors({
  origin: 'http://localhost/',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Accept, Origin, Content-Type, Referer',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(router);

app.listen(4000);
console.log('Server now listening on port 4000');
