const mongoose = require('mongoose');

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
