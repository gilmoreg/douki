const mongoose = require('mongoose');

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
