const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: String,
  password: {
    type: String,
    required: true,
  },
});

UserSchema.methods.validatePassword = (password, modelPassword, cb) => {
  bcrypt.compare(password, modelPassword, (err, res) => {
    if (err) {
      cb(err, false);
    }
    if (res) {
      cb(null, true);
    } else {
      cb(err, false);
    }
  });
};

UserSchema.statics.hashPassword = password =>
  bcrypt.hash(password, 10);

const User = mongoose.model('User', UserSchema);

module.exports = User;
