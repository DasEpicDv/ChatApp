const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Message = require('../models/messages.js');
const livedata = require('../livedata');
const moment = require('moment');

// User.find((err, data) => {
//     data.forEach(element => {
//         element.people = {};
//         element.notifications = [];
//         element.markModified("people");
//         element.markModified("notifications");
//         element.save();
//     });
// })

router.post('/register', async (req, res) => {
    const { user, email, password, password2 } = req.body;
    const errors = {};
    if (user == "") {
        errors.user = 'Please enter name';
    }
    if (email == "") {
        errors.email = 'Please enter email';
    } else if (email.includes(" ") || !email.endsWith("@gmail.com")) {
        errors.email = 'Invalid email';
    } else {
        await User.findOne({ 'email': email }, (err, user) => {
            if (user) {
                errors.email = "Email already exists";
            }
        })
    }


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
        const newUser = new User({
            name: user,
            email: email,
            password: password,
        });
        console.log(newUser);

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save((err, user) => {
                    if (err) throw err;
                    res.send({ "done": "" });
                })
            });
        });
    }
});

router.get('/profile', (req, res) => {
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
        req.send({ 'name': 'error', 'id': 'error' });
    }
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/getuser', (req, res) => {
    User.find(req.body.type, (err, users) => {
        sendUser = [];
        if (users) {
            users.forEach(element => {
               if (`${element["_id"]}` !== `${req.user["_id"]}`) {
                    let status = Boolean(livedata.sortByUserId[element["_id"]]);
                    let current = moment(`${element["lastSeen"]}`, 'YYYYMMDD, h:mm:ss:a');
                    let lastSeen = livedata.convertDateToLastSeen(current);
                    if (element["lastSeenTo"] === 1) {
                        let found = element.people.find(element => req.user._id);
                        if (!Boolean(found)) { status = false, lastSeen = null; }
                    } else if (element["lastSeenTo"] === 2) {
                        status = false;
                        lastSeen = null;
                    }
                    sendUser.push({ name: element.name, id: element["_id"], online: status, lastSeen: lastSeen, description: element["description"] });
               }
            });
        }
        res.send(sendUser);
    })
});

router.get('/getPeopleList', (req, res) => {
    User.findOne({ _id: req.user._id }, (err, users) => {
        sendUser = {};
        for (const key in users.people) {
            sendUser[key] = users.people[key];
        }
        res.send(sendUser);
    })
});

router.post('/addToPeopleList', (req, res) => {
    User.findOne({ _id: req.user._id }, (err, user) => {
        if (user.people[req.body.id]) {
            res.send({ 'alreadyIn': true });
        } else {
            user.people[req.body.id] = { 'blocked': false, 'shouldShow': true };
            user.notifications.push({ id: req.body.id, notification: 0 });
            user.markModified("people");
            user.markModified("notifications");
            user.save((err, user) => { res.send({ 'alreadyIn': false }) });
        }
    });
});

router.post('/getModifiedMessage', (req, res) => {
    Message.find({
        $or: [
            { $and: [{ 'sender': req.user["_id"], 'reciever': req.body.id }] },
            { $and: [{ 'reciever': req.user["_id"], 'sender': req.body.id }] },
        ]
    }, (err, data) => {
        let messages = [];
        let end = false;
        if (data){
            let $i = data.length >= req.body.max ? req.body.max : data.length;
            while ($i >= req.body.min && data[data.length - $i]) {
                messageData = data[data.length - $i];
                let user = messageData["sender"] == req.user._id ? 0 : 1;
                messages.push({ message: messageData["message"], 'user': user, 'date': moment(messageData['date'], 'YYYYMMDD, h:mm:ss:a').format('h:mm a'), 'realDate': moment(messageData['date'], 'YYYYMMDD, h:mm:ss:a').format()})
                $i--;
            }
            end = (req.body.max >= data.length);
        }
        res.send({messages:messages, 'end': end});
    });
});

// router.post('/addMessageToDB', (req, res) => {
//     if (Boolean(req.user.people.find(element => element === req.body.reciever)) && req.body.message !== ""){
//         const message = new Message({
//             'sender': req.user._id,
//             'reciever': req.body.reciever,
//             'message': req.body.message
//         })
//         message.save();
//     }
// });

router.post('/messageRead', (req, res) => {
    User.findOne({ _id: req.user._id }, (err, data) => {
        if (!data) return;
        let key = data["notifications"].findIndex(element => element.id === req.body.id);
        data["notifications"][key].notification = 0;
        data.markModified("notifications");
        data.save(() => res.send({}));
    });
});

router.post('/getNotification', (req, res) => {
    User.findOne({ _id: req.user._id }, (err, data) => {
        let key = data["notifications"].find(element => element.id === req.body.id);
        if (key) {
            res.send({ 'notification': key["notification"] });
        } else {
            res.send({ 'notfiication': 0 });
        }
    });
});

module.exports = router;