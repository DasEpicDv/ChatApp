"use strict";

var mongoose = require('mongoose');

var moment = require('moment');

var MessageSchema = new mongoose.Schema({
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
    "default": "message"
  },
  date: {
    type: String,
    "default": moment().format('YYYYMMDD, h:mm:ss:a')
  }
});
var Message = mongoose.model('message4', MessageSchema);
module.exports = Message;