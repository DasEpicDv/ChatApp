"use strict";

var express = require("express");

var router = express.Router();

var User = require('../models/User');

var livedata = require('../livedata');

var _require = require('../config/auth'),
    forwardAuthenticated = _require.forwardAuthenticated,
    ensureAuthenticated = _require.ensureAuthenticated;

router.get('/home', ensureAuthenticated, function (req, res) {
  res.status(200).render('home.pug');
  User.findById(req.user._id, function (err, user) {
    user.lastSeen = livedata.convertDateToLastSeen(moment('YYYYMMDD, h:mm:ss:a'));
    user.save();
  });
});
module.exports = router;