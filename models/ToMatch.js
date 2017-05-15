const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const ToMatchSchema = new mongoose.Schema({
  aniTitle: {
    type: String,
    required: true,
  },
  malID: {
    type: Number,
    required: true,
  },
  malTitle: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model('ToMatch', ToMatchSchema);
