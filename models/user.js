const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = new mongoose.Schema({
  profilePicture: {
    data: Buffer,
    contentType: String
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: moment().format('YYYYMMDD, h:mm:ss:a')
  },
  people: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notifications: {
    type: Array,
    default: []
  },
  description: {
    type: String,
    default: "Hi I'm using bravo's made chat website"
  },
  lastSeen: {
    type: String,
    default: moment().format('YYYYMMDD, h:mm:ss:a')
  },
  profilePictureTo: {
    type: Number,
    default: 0
  },
  lastSeenTo: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('ddddddddddd', UserSchema);
module.exports = User;