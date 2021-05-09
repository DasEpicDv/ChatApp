"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var passport = require('passport');

var User = require('../models/User');

var Message = require('../models/messages.js');

var livedata = require('../livedata');

var moment = require('moment'); // User.find((err, data) => {
//     data.forEach(element => {
//         element.people = {};
//         element.notifications = [];
//         element.markModified("people");
//         element.markModified("notifications");
//         element.save();
//     });
// })


router.post('/register', function _callee(req, res) {
  var _req$body, user, email, password, password2, errors, newUser;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, user = _req$body.user, email = _req$body.email, password = _req$body.password, password2 = _req$body.password2;
          errors = {};

          if (user == "") {
            errors.user = 'Please enter name';
          }

          if (!(email == "")) {
            _context.next = 7;
            break;
          }

          errors.email = 'Please enter email';
          _context.next = 13;
          break;

        case 7:
          if (!(email.includes(" ") || !email.endsWith("@gmail.com"))) {
            _context.next = 11;
            break;
          }

          errors.email = 'Invalid email';
          _context.next = 13;
          break;

        case 11:
          _context.next = 13;
          return regeneratorRuntime.awrap(User.findOne({
            'email': email
          }, function (err, user) {
            if (user) {
              errors.email = "Email already exists";
            }
          }));

        case 13:
          if (password == "") {
            errors.password = 'Please enter password';
          } else if (password.length < 8) {
            errors.password = 'Password must be minimum of 8 characters';
          } else if (password2 !== password) {
            errors.password2 = 'Password do not match';
          }

          if (Object.keys(errors).length > 0) {
            res.send(errors);
          } else {
            newUser = new User({
              name: user,
              email: email,
              password: password
            });
            console.log(newUser);
            bcrypt.genSalt(10, function (err, salt) {
              bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) throw err;
                newUser.password = hash;
                newUser.save(function (err, user) {
                  if (err) throw err;
                  res.send({
                    "done": ""
                  });
                });
              });
            });
          }

        case 15:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/profile', function (req, res) {
  if (req.user) {
    res.send({
      'name': req.user.name,
      'id': req.user["_id"],
      'lastSeenTo': req.user.lastSeenTo,
      'profilePictureTo': req.user.profilePictureTo,
      'description': req.user.description,
      'email': req.user.email,
      'created': req.user.date
    });
  } else {
    req.send({
      'name': 'error',
      'id': 'error'
    });
  }
});
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});
router.post('/getuser', function (req, res) {
  User.find(req.body.type, function (err, users) {
    sendUser = [];

    if (users) {
      users.forEach(function (element) {
        if ("".concat(element["_id"]) !== "".concat(req.user["_id"])) {
          var status = Boolean(livedata.sortByUserId[element["_id"]]);
          var current = moment("".concat(element["lastSeen"]), 'YYYYMMDD, h:mm:ss:a');
          var lastSeen = livedata.convertDateToLastSeen(current);

          if (element["lastSeenTo"] === 1) {
            var found = element.people.find(function (element) {
              return req.user._id;
            });

            if (!Boolean(found)) {
              status = false, lastSeen = null;
            }
          } else if (element["lastSeenTo"] === 2) {
            status = false;
            lastSeen = null;
          }

          sendUser.push({
            name: element.name,
            id: element["_id"],
            online: status,
            lastSeen: lastSeen,
            description: element["description"]
          });
        }
      });
    }

    res.send(sendUser);
  });
});
router.get('/getPeopleList', function (req, res) {
  User.findOne({
    _id: req.user._id
  }, function (err, users) {
    sendUser = {};

    for (var key in users.people) {
      sendUser[key] = users.people[key];
    }

    res.send(sendUser);
  });
});
router.post('/addToPeopleList', function (req, res) {
  User.findOne({
    _id: req.user._id
  }, function (err, user) {
    if (user.people[req.body.id]) {
      res.send({
        'alreadyIn': true
      });
    } else {
      user.people[req.body.id] = {
        'blocked': false,
        'shouldShow': true
      };
      user.notifications.push({
        id: req.body.id,
        notification: 0
      });
      user.markModified("people");
      user.markModified("notifications");
      user.save(function (err, user) {
        res.send({
          'alreadyIn': false
        });
      });
    }
  });
});
router.post('/getModifiedMessage', function (req, res) {
  Message.find({
    $or: [{
      $and: [{
        'sender': req.user["_id"],
        'reciever': req.body.id
      }]
    }, {
      $and: [{
        'reciever': req.user["_id"],
        'sender': req.body.id
      }]
    }]
  }, function (err, data) {
    var messages = [];
    var end = false;

    if (data) {
      var $i = data.length >= req.body.max ? req.body.max : data.length;

      while ($i >= req.body.min && data[data.length - $i]) {
        messageData = data[data.length - $i];
        var user = messageData["sender"] == req.user._id ? 0 : 1;
        messages.push({
          message: messageData["message"],
          'user': user,
          'date': moment(messageData['date'], 'YYYYMMDD, h:mm:ss:a').format('h:mm a'),
          'realDate': moment(messageData['date'], 'YYYYMMDD, h:mm:ss:a').format()
        });
        $i--;
      }

      end = req.body.max >= data.length;
    }

    res.send({
      messages: messages,
      'end': end
    });
  });
}); // router.post('/addMessageToDB', (req, res) => {
//     if (Boolean(req.user.people.find(element => element === req.body.reciever)) && req.body.message !== ""){
//         const message = new Message({
//             'sender': req.user._id,
//             'reciever': req.body.reciever,
//             'message': req.body.message
//         })
//         message.save();
//     }
// });

router.post('/messageRead', function (req, res) {
  User.findOne({
    _id: req.user._id
  }, function (err, data) {
    if (!data) return;
    var key = data["notifications"].findIndex(function (element) {
      return element.id === req.body.id;
    });
    data["notifications"][key].notification = 0;
    data.markModified("notifications");
    data.save(function () {
      return res.send({});
    });
  });
});
router.post('/getNotification', function (req, res) {
  User.findOne({
    _id: req.user._id
  }, function (err, data) {
    var key = data["notifications"].find(function (element) {
      return element.id === req.body.id;
    });

    if (key) {
      res.send({
        'notification': key["notification"]
      });
    } else {
      res.send({
        'notfiication': 0
      });
    }
  });
});
module.exports = router;