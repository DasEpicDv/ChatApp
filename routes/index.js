const express = require("express");
const router = express.Router();
const User = require('../models/User');
const livedata = require('../livedata');

const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

router.get('/home', ensureAuthenticated, (req, res) => {
    res.status(200).render('home.pug');
    User.findById(req.user._id, (err, user) => {
        user.lastSeen = livedata.convertDateToLastSeen(moment('YYYYMMDD, h:mm:ss:a'));
        user.save();
    });
});

module.exports = router;