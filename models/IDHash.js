const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const IDHashSchema = new mongoose.Schema({
  aniTitle: {
    type: String,
    required: true,
  },
  malID: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('IDHash', IDHashSchema);
