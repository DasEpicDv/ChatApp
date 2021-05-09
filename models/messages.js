const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  message: {
      type: String,
      required: true
  },
  reciever: {
      type: String,
      required: true
  },
  type: {
      type: String,
      default: "message"
  },
  date: {
    type: String,
    default: moment().format('YYYYMMDD, h:mm:ss:a')
  }
});

const Message = mongoose.model('message5', MessageSchema);
module.exports = Message;