const mongoose = require('mongoose');

const IDHashSchema = new mongoose.Schema({
  malID: {
    type: Number,
    required: true,
  },
  aniID: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('IDHash', IDHashSchema);
