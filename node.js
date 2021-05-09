const express = require("express");
const passport = require("passport");
const path = require("path");
const flash = require('connect-flash');
// const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const moment = require('moment');

const app = express();
const session = require('express-session');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require('./config/passport')(passport);
const User = require('./models/User');
const Message = require('./models/messages.js');

const livedata = require('./livedata');

const port = 80;

const { forwardAuthenticated, ensureAuthenticated } = require('./config/auth');
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/testzz', { useNewUrlParser: true, useUnifiedTopology: true });

const users = {};
const sortByUserId = {};



io.on('connection', socket => {
    socket.on('user-connected', user => {
        livedata.users[socket.id] = user;
        livedata.sortByUserId[user["id"]] = socket.id;
    });
    socket.on('sendMessage', data => {
        if (Boolean(livedata.users[socket.id])) {
            User.findOne({ '_id': livedata.users[socket.id]["id"] }, async (err, user) => {
                let isNew = false;
                if (user.people[data["id"]]) {
                    const message = new Message({
                        'sender': livedata.users[socket.id]["id"],
                        'reciever': data["id"],
                        'message': data["message"]
                    });
                    message.save();
                    await User.findOne({ '_id': data["id"] }, (err, user) => {
                        if (!user) return;
                        let key = user["notifications"].findIndex(element => element.id === livedata.users[socket.id]["id"]);

                        if (key !== -1) {
                            user.notifications[key]['notification']++;
                        } else {
                            isNew = true;
                            user.people[livedata.users[socket.id]["id"]] = {'shouldShow': true, 'blocked': false};
                            user.notifications.push({ 'id': livedata.users[socket.id]["id"], 'notification': 0 });
                        }
                        user.markModified("people");
                        user.markModified("notifications");
                        user.save(function (err, fluffy) {
                            if (err) throw err;
                        });
                    });
                    if (livedata.sortByUserId[data["id"]]) {
                        io.to(livedata.sortByUserId[data["id"]]).emit('messageRecieve', { senderId: livedata.users[socket.id]["id"], message: data.message, isNew: isNew, date: moment().format('h:mm a') });
                    }
                }
            });
        } else {
            io.to(socket.id).emit('error');
        }
    });
    // socket.on('send', message=>{
    //     socket.broadcast.emit('receive', {"message":message, "name": users[socket.id]});
    // })
    socket.on('disconnect', function () {
    if (!Boolean(livedata.users[socket.id])) return;
        User.findOne({ '_id': livedata.users[socket.id]["id"] }, (err, user) => {
            user.lastSeen = moment().format('YYYYMMDD, h:mm:ss:a');
            user.save();
        });
        delete livedata.sortByUserId[livedata.users[socket.id]["id"]];
        delete livedata.users[socket.id];
    })
});

app.use("/static", express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ 'mongoUrl': 'mongodb://localhost/testerzz' }),
    cookie: {maxAge: 7.884e+9}
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//app.use('/', require('./routes/index.js'));

app.get('/login', forwardAuthenticated, (req, res) => {
    res.status(200).render('login.pug', { message: res.locals.error });
});

app.get('/', ensureAuthenticated, (req, res) => {
    res.redirect('/home');
});

app.get('/home', ensureAuthenticated, (req, res) => {
    res.status(200).render('home.pug', { user: req.user.name });
});

app.use('/requests', require('./routes/requests.js'));

server.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});