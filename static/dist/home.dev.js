"use strict";

var socket = io();
var ticking = false;
var lastKnownScroll = {};
var canScrollMore = {};
var ringTone = new Audio('./static/Sounds/ringtone.mp3');
var previouslyLoadedMessages = {};
var myProfile = {};

var getProfileData = function getProfileData() {
  var rawResponse, data;
  return regeneratorRuntime.async(function getProfileData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch('/requests/profile', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }));

        case 2:
          rawResponse = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 5:
          data = _context.sent;
          return _context.abrupt("return", data);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
};

var getNotification = function getNotification(id) {
  var rawResponse, data;
  return regeneratorRuntime.async(function getNotification$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(fetch('/requests/getNotification', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'id': id
            })
          }));

        case 2:
          rawResponse = _context2.sent;
          _context2.next = 5;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 5:
          data = _context2.sent;
          return _context2.abrupt("return", data["notification"]);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
};

var sendMessageReadReq = function sendMessageReadReq(id) {
  fetch('/requests/messageRead', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': id
    })
  });
};

var sendUserToTop = function sendUserToTop(id) {
  li = document.querySelector("#recent-list > li[data-user-id='".concat(id, "']"));
  li.remove();
  document.querySelector("#recent-list").append(li);
};

var enterMessageFunc = function enterMessageFunc(e) {
  var messageInputForm, id, data, _date, hour, _message;

  return regeneratorRuntime.async(function enterMessageFunc$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          messageInputForm = document.querySelector('#message-input-form');

          if (messageInputForm.value !== "") {
            id = document.querySelector('#removable').getAttribute('data-current-user');
            sendUserToTop(id);
            data = myProfile;
            _date = new Date();
            hour = 0;

            if (_date.getHours() > 11 && _date.getMinutes() > 59) {
              hour = _date.getHours() + ":" + _date.getMinutes() + " am";
            } else {
              hour = _date.getHours() - 12 + ":" + _date.getMinutes() + " pm";
            }

            _message = messageInputForm.value;
            addMessageToChatBox({
              'message': _message,
              user: 0,
              date: "".concat(hour)
            }, {
              'picture': data["name"].charAt(0)
            });
            messageInputForm.value = "";
            socket.emit('sendMessage', {
              'id': id,
              'message': _message
            });
          }

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
};

var getUserList = function getUserList() {
  var rawResponse, data;
  return regeneratorRuntime.async(function getUserList$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(fetch('/requests/getPeopleList', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }));

        case 2:
          rawResponse = _context4.sent;
          _context4.next = 5;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 5:
          data = _context4.sent;
          return _context4.abrupt("return", data);

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  });
};

var addToUserList = function addToUserList(id, s) {
  var rawResponse, data;
  return regeneratorRuntime.async(function addToUserList$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(fetch('/requests/addToPeopleList', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'id': id
            })
          }));

        case 2:
          rawResponse = _context5.sent;
          _context5.next = 5;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 5:
          data = _context5.sent;
          return _context5.abrupt("return", data);

        case 7:
        case "end":
          return _context5.stop();
      }
    }
  });
};

var getUserProfileData = function getUserProfileData(type) {
  var rawResponse, data;
  return regeneratorRuntime.async(function getUserProfileData$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(fetch('/requests/getuser', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
              type: type
            })
          }));

        case 2:
          rawResponse = _context6.sent;
          _context6.next = 5;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 5:
          data = _context6.sent;
          return _context6.abrupt("return", data);

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  });
};

var getMessagesOfUser = function getMessagesOfUser(userId) {
  var max,
      min,
      rawResponse,
      data,
      _args7 = arguments;
  return regeneratorRuntime.async(function getMessagesOfUser$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          max = _args7.length > 1 && _args7[1] !== undefined ? _args7[1] : 11;
          min = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : 1;
          _context7.next = 4;
          return regeneratorRuntime.awrap(fetch('/requests/getModifiedMessage', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'id': userId,
              'max': max,
              'min': min
            })
          }));

        case 4:
          rawResponse = _context7.sent;
          _context7.next = 7;
          return regeneratorRuntime.awrap(rawResponse.json());

        case 7:
          data = _context7.sent;
          return _context7.abrupt("return", data);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
};

var addToRecentList = function addToRecentList(id, name, online, lastSeen) {
  var li, status, noti, notiClass;
  return regeneratorRuntime.async(function addToRecentList$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          li = document.createElement('li');
          status = online ? 'user-status-online' : "user-status-offline";
          li.setAttribute('data-user-id', id);
          li.setAttribute('data-user-name', name);
          date = new Date();
          _context8.next = 7;
          return regeneratorRuntime.awrap(getNotification(id));

        case 7:
          noti = _context8.sent;
          notiClass = "<span class=\"notification\"><p class=\"notification-number\">0</p></span>";

          if (noti > 0) {
            notiClass = "<span class=\"notification notification-active\"><p class=\"notification-number\">".concat(noti, "</p></span>");
          }

          lastSeen = online ? "" : Boolean(lastSeen) ? lastSeen : 'Can\'t See';
          li.innerHTML = "<div class=\"user-container\">\n                        <div class=\"chat-user-img align-self-center mr-3 avatar-xs\">\n                            ".concat(notiClass, "\n                            <span class=\"user-icon rounded-circle bg-soft-primary text-primary\">").concat(name.charAt(0), "</span>\n                            <span class=\"user-status ").concat(status, "\"></span>\n                        </div>\n                        <div class=\"user-pr\">\n                            <h5 class=\"user-name text-truncate\">").concat(name, "</h5>\n                        </div>\n                        <div class=\"user-time\">\n                            <p>").concat(lastSeen, "</p>\n                        </div>\n                    </div>");
          document.querySelector('#recent-list').append(li);
          return _context8.abrupt("return");

        case 14:
        case "end":
          return _context8.stop();
      }
    }
  });
};

var addMessageToChatBox = function addMessageToChatBox(textMessage, userData) {
  var before,
      chatBox,
      _args9 = arguments;
  return regeneratorRuntime.async(function addMessageToChatBox$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          before = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : false;
          chatBox = document.querySelector('.chat-box');
          Realmessage = textMessage.message;
          user = textMessage.user;
          messageContainer = document.createElement('div');
          messageContainerFlexBox = document.createElement('div');
          messageContainerFlexBox.classList.add('message-container-flexbox');
          profilePicture = document.createElement('div');
          profilePicture.classList.add('message-profile-picture');
          profilePictureSpan = document.createElement('span');
          profilePictureSpan.className += " user-icon rounded-circle";
          messageContainerBox = document.createElement('div');
          messageContainerBox.classList.add('message-container-box');
          messageContainerBoxFlex = document.createElement('div');
          messageContainerBoxFlex.classList.add('message-container-box-flex');
          messageBox = document.createElement('div');
          messageBox.classList.add('message-box');
          message = document.createElement('div');
          message.classList.add('message');
          p = document.createElement('p');
          p.innerHTML = Realmessage;
          message.appendChild(p);
          chatTime = document.createElement('p');
          chatTime.classList.add('chat-time');
          chatTime.innerText = textMessage.date;
          messageBox.appendChild(message);
          messageBox.appendChild(chatTime);
          userName = document.createElement('div');
          userName.classList.add('message-user-name');
          userNameP = document.createElement('p');
          userNameP.className += " user-name text-truncate";

          if (user === 0) {
            profilePictureSpan.innerHTML = userData["picture"];
            messageContainer.className += "message-container right";
            userNameP.innerHTML = "You";
          } else {
            profilePictureSpan.innerHTML = userData.picture;
            messageContainer.className += "message-container left";
            userNameP.innerHTML = userData.name;
          }

          userName.appendChild(userNameP);
          profilePicture.appendChild(profilePictureSpan);
          messageContainerFlexBox.appendChild(profilePicture);
          messageContainerBoxFlex.appendChild(messageBox);
          messageContainerBox.appendChild(messageContainerBoxFlex);
          messageContainerBox.appendChild(userName);
          messageContainerFlexBox.appendChild(messageContainerBox);
          messageContainer.appendChild(messageContainerFlexBox);

          if (before) {
            chatBox.insertBefore(messageContainer, chatBox.childNodes[0]);
          } else {
            chatBox.appendChild(messageContainer);
          }

          return _context9.abrupt("return");

        case 42:
        case "end":
          return _context9.stop();
      }
    }
  });
};

var loadContents = function loadContents() {
  var data, logos, key, _gotData, searchResultFunction;

  return regeneratorRuntime.async(function loadContents$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return regeneratorRuntime.awrap(getProfileData());

        case 2:
          data = _context16.sent;
          socket.emit('user-connected', data);
          myProfile = {
            'id': data["id"],
            'name': data["name"],
            'email': data["email"],
            'description': data["description"],
            'created': data["created"]
          };
          document.querySelector("#add-name").innerText = data["name"];
          logos = document.querySelectorAll('#middle > .logo');
          logos.forEach(function (element) {
            element.addEventListener('click', function (e) {
              var theFor = e.currentTarget.getAttribute('data-for');
              var classes = document.querySelectorAll(".".concat(theFor));
              var oldActive = document.querySelector('.logo-active');

              if (oldActive) {
                oldActive.classList.remove('logo-active');
                var oldFor = oldActive.getAttribute('data-for');
                var oldClasses = document.querySelectorAll(".".concat(oldFor));
                oldClasses.forEach(function (element) {
                  element.style.display = 'none';
                });
              }

              classes.forEach(function (element) {
                element.style.display = 'block';
              });
              e.currentTarget.classList.add('logo-active');

              if (e.currentTarget.getAttribute("data-for") === "for-settings" || e.currentTarget.getAttribute("data-for") === "for-profile") {
                document.querySelector(".".concat(e.currentTarget.getAttribute("data-for"), " #add-name")).innerText = myProfile["name"];
                document.querySelector(".".concat(e.currentTarget.getAttribute("data-for"), " #add-description")).innerText = myProfile["description"];
              }
            });
          });
          document.querySelectorAll('.dropdown-card').forEach(function (element) {
            element.addEventListener('click', function _callee(e) {
              var content, obj;
              return regeneratorRuntime.async(function _callee$(_context10) {
                while (1) {
                  switch (_context10.prev = _context10.next) {
                    case 0:
                      if (e.target.nodeName === "I") {
                        content = e.currentTarget.nextElementSibling;

                        if (e.target.classList.contains("dropdown-card-arrow-right")) {
                          e.target.classList.remove("dropdown-card-arrow-right");
                          e.target.classList.add('dropdown-card-arrow-up');
                        } else {
                          e.target.classList.remove("dropdown-card-arrow-up");
                          e.target.classList.add('dropdown-card-arrow-right');
                        }

                        if (content.style.maxHeight) {
                          content.style.maxHeight = null;
                        } else {
                          obj = [myProfile['name'], myProfile['email'], myProfile['created']];
                          $i = 0;
                          e.target.parentNode.nextElementSibling.firstElementChild.childNodes.forEach(function (element) {
                            if (element.nodeName === "DIV") {
                              element.lastElementChild.innerText = obj[$i];
                              $i++;
                            }
                          });
                          content.style.maxHeight = content.scrollHeight + "px";
                        }
                      }

                    case 1:
                    case "end":
                      return _context10.stop();
                  }
                }
              });
            });
          });
          document.querySelector('#rest').addEventListener('keypress', function (e) {
            if (e.target.id = "message-input-form") {
              if (e.keyCode === 13) {
                e.preventDefault();
                enterMessageFunc();
              }
            }
          });
          document.querySelector('#rest').addEventListener('click', function (e) {
            var btn = document.querySelector('#enter-btn');

            if (e.target.id === 'enter-btn' || btn && btn.contains(e.target)) {
              enterMessageFunc();
            } else if (e.target.nodeName = "SPAN" && e.target.parentNode.classList.contains('emojis')) {
              var messageInputForm = document.querySelector('#message-input-form');
              messageInputForm.value = messageInputForm.value + e.target.innerText;
            } else if (e.target.classList.contains('return-btn')) {
              e.currentTarget.style.transform = "translateX(100%)";
            }
          });
          _context16.next = 13;
          return regeneratorRuntime.awrap(getUserList());

        case 13:
          data = _context16.sent;
          _context16.t0 = regeneratorRuntime.keys(data);

        case 15:
          if ((_context16.t1 = _context16.t0()).done) {
            _context16.next = 23;
            break;
          }

          key = _context16.t1.value;
          _context16.next = 19;
          return regeneratorRuntime.awrap(getUserProfileData({
            '_id': key
          }));

        case 19:
          _gotData = _context16.sent;

          if (data[key]["shouldShow"]) {
            addToRecentList(key, _gotData[0]["name"], _gotData[0]['online'], _gotData[0]['lastSeen']);
          }

          _context16.next = 15;
          break;

        case 23:
          document.querySelector("#recent-list").addEventListener('click', function _callee3(e) {
            var toUserId, toName, active, myinfo, theirInfo, online, myUserData, hisUserData, messages, rest;
            return regeneratorRuntime.async(function _callee3$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    a = false;
                    parent = e.target;
                    els = [];

                    while (a === false) {
                      els.unshift(parent);
                      parent = parent.parentNode;

                      if (parent.nodeName == "LI") {
                        a = parent;
                      }
                    }

                    if (!(e.target && a.nodeName == "LI")) {
                      _context12.next = 39;
                      break;
                    }

                    li = a;
                    toUserId = li.getAttribute('data-user-id');
                    toName = li.getAttribute('data-user-name');
                    li.classList.add("user-active");
                    active = document.querySelector('.user-active');
                    if (active) active.classList.remove('user-active');
                    active = document.querySelector("#recent-list > li[data-user-id='".concat(toUserId, "'] .notification-active"));

                    if (active) {
                      sendMessageReadReq(toUserId);
                      active.classList.remove('notification-active');
                    }

                    ;
                    _context12.next = 16;
                    return regeneratorRuntime.awrap(getProfileData());

                  case 16:
                    myinfo = _context12.sent;
                    _context12.next = 19;
                    return regeneratorRuntime.awrap(getUserProfileData({
                      '_id': toUserId
                    }));

                  case 19:
                    theirInfo = _context12.sent[0];
                    online = theirInfo["online"] ? 'user-status-online' : "user-status-offline";
                    document.querySelector('#removable').setAttribute('data-current-user', toUserId);
                    document.querySelector('#removable').innerHTML = "<div id=\"chat-onTop\" class=\"p-3 p-lg-4 border-bottom\">\n                    <div id=\"chat-onTopItems\">\n                        <div id=\"chat-onTop-profile\" class=\"col-sm-4 col-8\">\n                            <span class=\"dropdown-card-arrow return-btn\">chevron_left</span>\n                            <div class=\"chat-user-img align-self-center mr-3 avatar-xs\">\n                                <span class=\"user-icon rounded-circle bg-soft-primary text-primary\">".concat(theirInfo["name"].charAt(0), "</span>\n                                <span class=\"user-status ").concat(online, "\"></span>\n                            </div>\n                            <div style=\"overflow: hidden;\">\n                                <p class=\"user-name text-truncate\">").concat(theirInfo["name"], "</p>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"chat-box\">\n\n                </div>\n                <div class=\"chat-enter p-3 p-lg-4 border-top mb-0\">\n                <textarea id=\"message-input-form\" placeholder=\"Type Message\" class=\"form-control form-control-lg bg-light border-light rounded\" style=\"min-height: 20px; padding-left: 12px;\"></textarea>\n                <div class=\"chat-btn-area\">\n                    <div  id=\"emoji-btn\">\n                        <button class=\"pointer\">\n                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" fill=\"currentColor\" class=\"bi bi-emoji-smile\" viewBox=\"0 0 16 16\">\n                                <path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z\"/>\n                                <path d=\"M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z\"/>\n                            </svg>\n                            <div id=\"inner\" style=\"cursor: default;\">\n                                <div id=\"search\">\n                                    <input type=\"text\" class=\"form-control\" id=\"autoSizingInputGroup\" placeholder=\"Search for Emoji\">\n                                </div>\n                                <div id=\"emoji-list\">\n                                    <div class=\"emoji-category\">\n                                        <h5>PEOPLE</h5>\n                                        <div class=\"emojis\">\n                                            <span title=\"smile\">\uD83D\uDE04</span><span data-v-1cd1a04e=\"\" title=\"smiley\">\uD83D\uDE03</span><span data-v-1cd1a04e=\"\" title=\"grinning\">\uD83D\uDE00</span><span data-v-1cd1a04e=\"\" title=\"blush\">\uD83D\uDE0A</span><span data-v-1cd1a04e=\"\" title=\"wink\">\uD83D\uDE09</span><span data-v-1cd1a04e=\"\" title=\"heart_eyes\">\uD83D\uDE0D</span><span data-v-1cd1a04e=\"\" title=\"kissing_heart\">\uD83D\uDE18</span><span data-v-1cd1a04e=\"\" title=\"kissing_closed_eyes\">\uD83D\uDE1A</span><span data-v-1cd1a04e=\"\" title=\"kissing\">\uD83D\uDE17</span><span data-v-1cd1a04e=\"\" title=\"kissing_smiling_eyes\">\uD83D\uDE19</span><span data-v-1cd1a04e=\"\" title=\"stuck_out_tongue_winking_eye\">\uD83D\uDE1C</span><span data-v-1cd1a04e=\"\" title=\"stuck_out_tongue_closed_eyes\">\uD83D\uDE1D</span><span data-v-1cd1a04e=\"\" title=\"stuck_out_tongue\">\uD83D\uDE1B</span><span data-v-1cd1a04e=\"\" title=\"flushed\">\uD83D\uDE33</span><span data-v-1cd1a04e=\"\" title=\"grin\">\uD83D\uDE01</span><span data-v-1cd1a04e=\"\" title=\"pensive\">\uD83D\uDE14</span><span data-v-1cd1a04e=\"\" title=\"relieved\">\uD83D\uDE0C</span><span data-v-1cd1a04e=\"\" title=\"unamused\">\uD83D\uDE12</span><span data-v-1cd1a04e=\"\" title=\"disappointed\">\uD83D\uDE1E</span><span data-v-1cd1a04e=\"\" title=\"persevere\">\uD83D\uDE23</span><span data-v-1cd1a04e=\"\" title=\"cry\">\uD83D\uDE22</span><span data-v-1cd1a04e=\"\" title=\"joy\">\uD83D\uDE02</span><span data-v-1cd1a04e=\"\" title=\"sob\">\uD83D\uDE2D</span><span data-v-1cd1a04e=\"\" title=\"sleepy\">\uD83D\uDE2A</span><span data-v-1cd1a04e=\"\" title=\"disappointed_relieved\">\uD83D\uDE25</span><span data-v-1cd1a04e=\"\" title=\"cold_sweat\">\uD83D\uDE30</span><span data-v-1cd1a04e=\"\" title=\"sweat_smile\">\uD83D\uDE05</span><span data-v-1cd1a04e=\"\" title=\"sweat\">\uD83D\uDE13</span><span data-v-1cd1a04e=\"\" title=\"weary\">\uD83D\uDE29</span><span data-v-1cd1a04e=\"\" title=\"tired_face\">\uD83D\uDE2B</span><span data-v-1cd1a04e=\"\" title=\"fearful\">\uD83D\uDE28</span><span data-v-1cd1a04e=\"\" title=\"scream\">\uD83D\uDE31</span><span data-v-1cd1a04e=\"\" title=\"angry\">\uD83D\uDE20</span><span data-v-1cd1a04e=\"\" title=\"rage\">\uD83D\uDE21</span><span data-v-1cd1a04e=\"\" title=\"triumph\">\uD83D\uDE24</span><span data-v-1cd1a04e=\"\" title=\"confounded\">\uD83D\uDE16</span><span data-v-1cd1a04e=\"\" title=\"laughing\">\uD83D\uDE06</span><span data-v-1cd1a04e=\"\" title=\"yum\">\uD83D\uDE0B</span><span data-v-1cd1a04e=\"\" title=\"mask\">\uD83D\uDE37</span><span data-v-1cd1a04e=\"\" title=\"sunglasses\">\uD83D\uDE0E</span><span data-v-1cd1a04e=\"\" title=\"sleeping\">\uD83D\uDE34</span><span data-v-1cd1a04e=\"\" title=\"dizzy_face\">\uD83D\uDE35</span><span data-v-1cd1a04e=\"\" title=\"astonished\">\uD83D\uDE32</span><span data-v-1cd1a04e=\"\" title=\"worried\">\uD83D\uDE1F</span><span data-v-1cd1a04e=\"\" title=\"frowning\">\uD83D\uDE26</span><span data-v-1cd1a04e=\"\" title=\"anguished\">\uD83D\uDE27</span><span data-v-1cd1a04e=\"\" title=\"imp\">\uD83D\uDC7F</span><span data-v-1cd1a04e=\"\" title=\"open_mouth\">\uD83D\uDE2E</span><span data-v-1cd1a04e=\"\" title=\"grimacing\">\uD83D\uDE2C</span><span data-v-1cd1a04e=\"\" title=\"neutral_face\">\uD83D\uDE10</span><span data-v-1cd1a04e=\"\" title=\"confused\">\uD83D\uDE15</span><span data-v-1cd1a04e=\"\" title=\"hushed\">\uD83D\uDE2F</span><span data-v-1cd1a04e=\"\" title=\"smirk\">\uD83D\uDE0F</span><span data-v-1cd1a04e=\"\" title=\"expressionless\">\uD83D\uDE11</span><span data-v-1cd1a04e=\"\" title=\"man_with_gua_pi_mao\">\uD83D\uDC72</span><span data-v-1cd1a04e=\"\" title=\"man_with_turban\">\uD83D\uDC73</span><span data-v-1cd1a04e=\"\" title=\"cop\">\uD83D\uDC6E</span><span data-v-1cd1a04e=\"\" title=\"construction_worker\">\uD83D\uDC77</span><span data-v-1cd1a04e=\"\" title=\"guardsman\">\uD83D\uDC82</span><span data-v-1cd1a04e=\"\" title=\"baby\">\uD83D\uDC76</span><span data-v-1cd1a04e=\"\" title=\"boy\">\uD83D\uDC66</span><span data-v-1cd1a04e=\"\" title=\"girl\">\uD83D\uDC67</span><span data-v-1cd1a04e=\"\" title=\"man\">\uD83D\uDC68</span><span data-v-1cd1a04e=\"\" title=\"woman\">\uD83D\uDC69</span><span data-v-1cd1a04e=\"\" title=\"older_man\">\uD83D\uDC74</span><span data-v-1cd1a04e=\"\" title=\"older_woman\">\uD83D\uDC75</span><span data-v-1cd1a04e=\"\" title=\"person_with_blond_hair\">\uD83D\uDC71</span><span data-v-1cd1a04e=\"\" title=\"angel\">\uD83D\uDC7C</span><span data-v-1cd1a04e=\"\" title=\"princess\">\uD83D\uDC78</span><span data-v-1cd1a04e=\"\" title=\"smiley_cat\">\uD83D\uDE3A</span><span data-v-1cd1a04e=\"\" title=\"smile_cat\">\uD83D\uDE38</span><span data-v-1cd1a04e=\"\" title=\"heart_eyes_cat\">\uD83D\uDE3B</span><span data-v-1cd1a04e=\"\" title=\"kissing_cat\">\uD83D\uDE3D</span><span data-v-1cd1a04e=\"\" title=\"smirk_cat\">\uD83D\uDE3C</span><span data-v-1cd1a04e=\"\" title=\"scream_cat\">\uD83D\uDE40</span><span data-v-1cd1a04e=\"\" title=\"crying_cat_face\">\uD83D\uDE3F</span><span data-v-1cd1a04e=\"\" title=\"joy_cat\">\uD83D\uDE39</span><span data-v-1cd1a04e=\"\" title=\"pouting_cat\">\uD83D\uDE3E</span><span data-v-1cd1a04e=\"\" title=\"japanese_ogre\">\uD83D\uDC79</span><span data-v-1cd1a04e=\"\" title=\"japanese_goblin\">\uD83D\uDC7A</span><span data-v-1cd1a04e=\"\" title=\"see_no_evil\">\uD83D\uDE48</span><span data-v-1cd1a04e=\"\" title=\"hear_no_evil\">\uD83D\uDE49</span><span data-v-1cd1a04e=\"\" title=\"speak_no_evil\">\uD83D\uDE4A</span><span data-v-1cd1a04e=\"\" title=\"skull\">\uD83D\uDC80</span><span data-v-1cd1a04e=\"\" title=\"alien\">\uD83D\uDC7D</span><span data-v-1cd1a04e=\"\" title=\"hankey\">\uD83D\uDCA9</span><span data-v-1cd1a04e=\"\" title=\"fire\">\uD83D\uDD25</span><span data-v-1cd1a04e=\"\" title=\"sparkles\">\u2728</span><span data-v-1cd1a04e=\"\" title=\"star2\">\uD83C\uDF1F</span><span data-v-1cd1a04e=\"\" title=\"dizzy\">\uD83D\uDCAB</span><span data-v-1cd1a04e=\"\" title=\"boom\">\uD83D\uDCA5</span><span data-v-1cd1a04e=\"\" title=\"anger\">\uD83D\uDCA2</span><span data-v-1cd1a04e=\"\" title=\"sweat_drops\">\uD83D\uDCA6</span><span data-v-1cd1a04e=\"\" title=\"droplet\">\uD83D\uDCA7</span><span data-v-1cd1a04e=\"\" title=\"zzz\">\uD83D\uDCA4</span><span data-v-1cd1a04e=\"\" title=\"dash\">\uD83D\uDCA8</span><span data-v-1cd1a04e=\"\" title=\"ear\">\uD83D\uDC42</span><span data-v-1cd1a04e=\"\" title=\"eyes\">\uD83D\uDC40</span><span data-v-1cd1a04e=\"\" title=\"nose\">\uD83D\uDC43</span><span data-v-1cd1a04e=\"\" title=\"tongue\">\uD83D\uDC45</span><span data-v-1cd1a04e=\"\" title=\"lips\">\uD83D\uDC44</span><span data-v-1cd1a04e=\"\" title=\"thumbs_up\">\uD83D\uDC4D</span><span data-v-1cd1a04e=\"\" title=\"-1\">\uD83D\uDC4E</span><span data-v-1cd1a04e=\"\" title=\"ok_hand\">\uD83D\uDC4C</span><span data-v-1cd1a04e=\"\" title=\"facepunch\">\uD83D\uDC4A</span><span data-v-1cd1a04e=\"\" title=\"fist\">\u270A</span><span data-v-1cd1a04e=\"\" title=\"wave\">\uD83D\uDC4B</span><span data-v-1cd1a04e=\"\" title=\"hand\">\u270B</span><span data-v-1cd1a04e=\"\" title=\"open_hands\">\uD83D\uDC50</span><span data-v-1cd1a04e=\"\" title=\"point_up_2\">\uD83D\uDC46</span><span data-v-1cd1a04e=\"\" title=\"point_down\">\uD83D\uDC47</span><span data-v-1cd1a04e=\"\" title=\"point_right\">\uD83D\uDC49</span><span data-v-1cd1a04e=\"\" title=\"point_left\">\uD83D\uDC48</span><span data-v-1cd1a04e=\"\" title=\"raised_hands\">\uD83D\uDE4C</span><span data-v-1cd1a04e=\"\" title=\"pray\">\uD83D\uDE4F</span><span data-v-1cd1a04e=\"\" title=\"clap\">\uD83D\uDC4F</span><span data-v-1cd1a04e=\"\" title=\"muscle\">\uD83D\uDCAA</span><span data-v-1cd1a04e=\"\" title=\"walking\">\uD83D\uDEB6</span><span data-v-1cd1a04e=\"\" title=\"runner\">\uD83C\uDFC3</span><span data-v-1cd1a04e=\"\" title=\"dancer\">\uD83D\uDC83</span><span data-v-1cd1a04e=\"\" title=\"couple\">\uD83D\uDC6B</span><span data-v-1cd1a04e=\"\" title=\"family\">\uD83D\uDC6A</span><span data-v-1cd1a04e=\"\" title=\"couplekiss\">\uD83D\uDC8F</span><span data-v-1cd1a04e=\"\" title=\"couple_with_heart\">\uD83D\uDC91</span><span data-v-1cd1a04e=\"\" title=\"dancers\">\uD83D\uDC6F</span><span data-v-1cd1a04e=\"\" title=\"ok_woman\">\uD83D\uDE46</span><span data-v-1cd1a04e=\"\" title=\"no_good\">\uD83D\uDE45</span><span data-v-1cd1a04e=\"\" title=\"information_desk_person\">\uD83D\uDC81</span><span data-v-1cd1a04e=\"\" title=\"raising_hand\">\uD83D\uDE4B</span><span data-v-1cd1a04e=\"\" title=\"massage\">\uD83D\uDC86</span><span data-v-1cd1a04e=\"\" title=\"haircut\">\uD83D\uDC87</span><span data-v-1cd1a04e=\"\" title=\"nail_care\">\uD83D\uDC85</span><span data-v-1cd1a04e=\"\" title=\"bride_with_veil\">\uD83D\uDC70</span><span data-v-1cd1a04e=\"\" title=\"person_with_pouting_face\">\uD83D\uDE4E</span><span data-v-1cd1a04e=\"\" title=\"person_frowning\">\uD83D\uDE4D</span><span data-v-1cd1a04e=\"\" title=\"bow\">\uD83D\uDE47</span><span data-v-1cd1a04e=\"\" title=\"tophat\">\uD83C\uDFA9</span><span data-v-1cd1a04e=\"\" title=\"crown\">\uD83D\uDC51</span><span data-v-1cd1a04e=\"\" title=\"womans_hat\">\uD83D\uDC52</span><span data-v-1cd1a04e=\"\" title=\"athletic_shoe\">\uD83D\uDC5F</span><span data-v-1cd1a04e=\"\" title=\"mans_shoe\">\uD83D\uDC5E</span><span data-v-1cd1a04e=\"\" title=\"sandal\">\uD83D\uDC61</span><span data-v-1cd1a04e=\"\" title=\"high_heel\">\uD83D\uDC60</span><span data-v-1cd1a04e=\"\" title=\"boot\">\uD83D\uDC62</span><span data-v-1cd1a04e=\"\" title=\"shirt\">\uD83D\uDC55</span><span data-v-1cd1a04e=\"\" title=\"necktie\">\uD83D\uDC54</span><span data-v-1cd1a04e=\"\" title=\"womans_clothes\">\uD83D\uDC5A</span><span data-v-1cd1a04e=\"\" title=\"dress\">\uD83D\uDC57</span><span data-v-1cd1a04e=\"\" title=\"running_shirt_with_sash\">\uD83C\uDFBD</span><span data-v-1cd1a04e=\"\" title=\"jeans\">\uD83D\uDC56</span><span data-v-1cd1a04e=\"\" title=\"kimono\">\uD83D\uDC58</span><span data-v-1cd1a04e=\"\" title=\"bikini\">\uD83D\uDC59</span><span data-v-1cd1a04e=\"\" title=\"briefcase\">\uD83D\uDCBC</span><span data-v-1cd1a04e=\"\" title=\"handbag\">\uD83D\uDC5C</span><span data-v-1cd1a04e=\"\" title=\"pouch\">\uD83D\uDC5D</span><span data-v-1cd1a04e=\"\" title=\"purse\">\uD83D\uDC5B</span><span data-v-1cd1a04e=\"\" title=\"eyeglasses\">\uD83D\uDC53</span><span data-v-1cd1a04e=\"\" title=\"ribbon\">\uD83C\uDF80</span><span data-v-1cd1a04e=\"\" title=\"closed_umbrella\">\uD83C\uDF02</span><span data-v-1cd1a04e=\"\" title=\"lipstick\">\uD83D\uDC84</span><span data-v-1cd1a04e=\"\" title=\"yellow_heart\">\uD83D\uDC9B</span><span data-v-1cd1a04e=\"\" title=\"blue_heart\">\uD83D\uDC99</span><span data-v-1cd1a04e=\"\" title=\"purple_heart\">\uD83D\uDC9C</span><span data-v-1cd1a04e=\"\" title=\"green_heart\">\uD83D\uDC9A</span><span data-v-1cd1a04e=\"\" title=\"broken_heart\">\uD83D\uDC94</span><span data-v-1cd1a04e=\"\" title=\"heartpulse\">\uD83D\uDC97</span><span data-v-1cd1a04e=\"\" title=\"heartbeat\">\uD83D\uDC93</span><span data-v-1cd1a04e=\"\" title=\"two_hearts\">\uD83D\uDC95</span><span data-v-1cd1a04e=\"\" title=\"sparkling_heart\">\uD83D\uDC96</span><span data-v-1cd1a04e=\"\" title=\"revolving_hearts\">\uD83D\uDC9E</span><span data-v-1cd1a04e=\"\" title=\"cupid\">\uD83D\uDC98</span><span data-v-1cd1a04e=\"\" title=\"love_letter\">\uD83D\uDC8C</span><span data-v-1cd1a04e=\"\" title=\"kiss\">\uD83D\uDC8B</span><span data-v-1cd1a04e=\"\" title=\"ring\">\uD83D\uDC8D</span><span data-v-1cd1a04e=\"\" title=\"gem\">\uD83D\uDC8E</span><span data-v-1cd1a04e=\"\" title=\"bust_in_silhouette\">\uD83D\uDC64</span><span data-v-1cd1a04e=\"\" title=\"speech_balloon\">\uD83D\uDCAC</span><span data-v-1cd1a04e=\"\" title=\"footprints\">\uD83D\uDC63</span>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </button>\n                    </div>\n                    <button class=\"pointer\" id=\"enter-btn\">\n                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-box-arrow-in-right\" viewBox=\"0 0 16 16\">\n                            <path fill-rule=\"evenodd\" d=\"M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z\"/>\n                            <path fill-rule=\"evenodd\" d=\"M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z\"/>\n                        </svg>\n                    </button>\n                </div>\n            </div>");
                    myUserData = {
                      'name': myinfo["name"],
                      'picture': myinfo["name"].charAt(0)
                    };
                    hisUserData = {
                      'name': theirInfo["name"],
                      'picture': theirInfo["name"].charAt(0)
                    };
                    messages = {};

                    if (!previouslyLoadedMessages[toUserId]) {
                      _context12.next = 30;
                      break;
                    }

                    messages = previouslyLoadedMessages[toUserId];
                    _context12.next = 37;
                    break;

                  case 30:
                    _context12.next = 32;
                    return regeneratorRuntime.awrap(getMessagesOfUser(toUserId));

                  case 32:
                    gotData = _context12.sent;
                    lastKnownScroll[toUserId] = 11;

                    if (gotData["end"]) {
                      canScrollMore[toUserId] = false;
                    } else {
                      canScrollMore[toUserId] = true;
                    }

                    messages = gotData["messages"];
                    previouslyLoadedMessages[toUserId] = messages;

                  case 37:
                    messages.forEach(function (element) {
                      var data = myUserData;

                      if (element["user"] === 1) {
                        data = hisUserData;
                      }

                      addMessageToChatBox(element, data);
                    });
                    document.querySelector('.chat-box').addEventListener('scroll', function (e) {
                      if (e.currentTarget.scrollTop == 0 && canScrollMore[document.querySelector('#removable').getAttribute('data-current-user')]) {
                        if (!ticking) {
                          window.requestAnimationFrame(function _callee2() {
                            var messages, myinfo, theirInfo, myUserData, hisUserData;
                            return regeneratorRuntime.async(function _callee2$(_context11) {
                              while (1) {
                                switch (_context11.prev = _context11.next) {
                                  case 0:
                                    lks = lastKnownScroll[document.querySelector('#removable').getAttribute('data-current-user')];
                                    _context11.next = 3;
                                    return regeneratorRuntime.awrap(getMessagesOfUser(document.querySelector('#removable').getAttribute('data-current-user'), lks + 15, lks + 1));

                                  case 3:
                                    messages = _context11.sent;

                                    if (messages["end"]) {
                                      canScrollMore[document.querySelector('#removable').getAttribute('data-current-user')] = false;
                                    }

                                    _context11.next = 7;
                                    return regeneratorRuntime.awrap(getProfileData());

                                  case 7:
                                    myinfo = _context11.sent;
                                    _context11.next = 10;
                                    return regeneratorRuntime.awrap(getUserProfileData({
                                      '_id': document.querySelector('#removable').getAttribute('data-current-user')
                                    }));

                                  case 10:
                                    theirInfo = _context11.sent[0];
                                    myUserData = {
                                      'name': myinfo["name"],
                                      'picture': myinfo["name"].charAt(0)
                                    };
                                    hisUserData = {
                                      'name': theirInfo["name"],
                                      'picture': theirInfo["name"].charAt(0)
                                    };
                                    previouslyLoadedMessages[document.querySelector('#removable').getAttribute('data-current-user')] = messages["messages"].concat(previouslyLoadedMessages[document.querySelector('#removable').getAttribute('data-current-user')]);
                                    messages["messages"].reverse().forEach(function (element) {
                                      var data = myUserData;

                                      if (element["user"] === 1) {
                                        data = hisUserData;
                                      }

                                      addMessageToChatBox(element, data, true);
                                    });
                                    lastKnownScroll[document.querySelector('#removable').getAttribute('data-current-user')] += 15;
                                    ticking = false;

                                  case 17:
                                  case "end":
                                    return _context11.stop();
                                }
                              }
                            });
                          });
                          ticking = true;
                        }
                      }
                    });

                  case 39:
                    rest = document.querySelector("#rest");
                    rest.style.transform = "translateX(0%)";

                  case 41:
                  case "end":
                    return _context12.stop();
                }
              }
            });
          });

          searchResultFunction = function searchResultFunction(e) {
            var users, ul, _key, _data;

            return regeneratorRuntime.async(function searchResultFunction$(_context13) {
              while (1) {
                switch (_context13.prev = _context13.next) {
                  case 0:
                    users = [];

                    if (!(e.currentTarget.value !== "")) {
                      _context13.next = 5;
                      break;
                    }

                    _context13.next = 4;
                    return regeneratorRuntime.awrap(getUserProfileData({
                      'name': {
                        "$regex": e.currentTarget.value,
                        "$options": "i"
                      }
                    }));

                  case 4:
                    users = _context13.sent;

                  case 5:
                    ul = document.querySelector(".search-box ul");
                    ul.innerHTML = "";

                    for (_key in users) {
                      _data = users[_key];
                      ul.innerHTML = ul.innerHTML + "<li data-searches-id='".concat(_data["id"], "'>\n                    <div class=\"user-container\">\n                        <div class=\"chat-user-img align-self-center mr-3 avatar-xs\">\n                            <span class=\"user-icon rounded-circle bg-soft-primary text-primary\">").concat(_data["name"].charAt(0), "</span>\n                        </div>\n                        <div class=\"user-pr\">\n                            <h5 class=\"user-name text-truncate\">").concat(_data["name"], "</h5>\n                        </div>\n                    </div>\n                </li>");
                    }

                  case 8:
                  case "end":
                    return _context13.stop();
                }
              }
            });
          };

          document.querySelector(".search-box form input").addEventListener('input', searchResultFunction);
          document.querySelector(".search-box form input").addEventListener('focus', searchResultFunction);
          document.querySelector(".search-box ul").addEventListener('click', function _callee4(e) {
            var opened, profile;
            return regeneratorRuntime.async(function _callee4$(_context14) {
              while (1) {
                switch (_context14.prev = _context14.next) {
                  case 0:
                    a = false;
                    parent = e.target;
                    els = [];

                    while (a === false) {
                      els.unshift(parent);
                      parent = parent.parentNode;

                      if (parent.nodeName == "LI") {
                        a = parent;
                      }
                    }

                    if (!(e.target && a.nodeName == "LI")) {
                      _context14.next = 12;
                      break;
                    }

                    li = a;
                    opened = document.querySelector('#openedUser');
                    _context14.next = 9;
                    return regeneratorRuntime.awrap(getUserProfileData({
                      '_id': li.getAttribute('data-searches-id')
                    }));

                  case 9:
                    profile = _context14.sent[0];
                    opened.innerHTML = "\n                    <div class=\"content mx-auto my-auto\">\n                        <div class=\"p-3 p-lg-4 border-bottom\">\n                            <div class=\"items row\">\n                                <div class=\"profile col-sm-4 col-8\">\n                                    <div class=\"user-container\" style=\"border-top: none;padding: 0;\">\n                                        <span class=\"dropdown-card-arrow return-btn\">chevron_left</span>\n                                        <div class=\"chat-user-img align-self-center mr-3 avatar-xs\">\n                                            <span class=\"user-icon rounded-circle bg-soft-primary text-primary\">".concat(profile["name"].charAt(0), "</span>\n                                        </div>\n                                        <div class=\"user-pr\">\n                                            <h5 class=\"user-name text-truncate\">").concat(profile["name"], "</h5>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div class=\"col-sm-8 col-4 text-right\">\n                                    <button data-user-id='").concat(profile["id"], "' class=\"btn btn-success send-btn\">Send Message</button>\n                                </div>\n                            </div>\n                        </div>\n                        <div style=\"padding: 31px;\">\n                            <div class=\"openedUser-info\" style=\"display: flex; flex-direction: column;color: white;\">\n                                <p class=\"text-muted\" style=\"font-size: 19px;text-align: center;\">").concat(profile["description"], "</p>\n                            </div>\n                        </div>\n                    </div>\n            ");
                    opened.style.display = "flex";

                  case 12:
                  case "end":
                    return _context14.stop();
                }
              }
            });
          });
          document.querySelector('#container').addEventListener('click', function (e) {
            var parent = document.querySelector(".search-box");

            if (!parent.contains(e.target)) {
              document.querySelector('.search-box ul').innerHTML = "";
            }
          });
          document.querySelector('#openedUser').addEventListener('click', function _callee5(e) {
            var name, returnedData;
            return regeneratorRuntime.async(function _callee5$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    if (e.target.classList.contains("send-btn") || e.target.classList.contains("return-btn")) {
                      e.currentTarget.style.display = "none";
                    }

                    if (!e.target.classList.contains("send-btn")) {
                      _context15.next = 20;
                      break;
                    }

                    _context15.next = 4;
                    return regeneratorRuntime.awrap(getUserProfileData({
                      '_id': e.target.getAttribute('data-user-id')
                    }));

                  case 4:
                    name = _context15.sent[0]["name"];
                    _context15.next = 7;
                    return regeneratorRuntime.awrap(addToUserList(e.target.getAttribute('data-user-id')));

                  case 7:
                    returnedData = _context15.sent;

                    if (!returnedData['alreadyIn']) {
                      _context15.next = 19;
                      break;
                    }

                    _context15.next = 11;
                    return regeneratorRuntime.awrap(getUserList());

                  case 11:
                    _context15.t0 = e.target.getAttribute('data-user-id');

                    if (_context15.sent[_context15.t0]['shouldShow']) {
                      _context15.next = 16;
                      break;
                    }

                    addToRecentList(e.target.getAttribute('data-user-id'), name);
                    _context15.next = 17;
                    break;

                  case 16:
                    document.querySelector("#recent li[data-user-id='".concat(e.target.getAttribute('data-user-id'), "']")).scrollIntoView({
                      'behavior': 'smooth'
                    });

                  case 17:
                    _context15.next = 20;
                    break;

                  case 19:
                    addToRecentList(e.target.getAttribute('data-user-id'), name);

                  case 20:
                  case "end":
                    return _context15.stop();
                }
              }
            });
          });
          return _context16.abrupt("return");

        case 31:
        case "end":
          return _context16.stop();
      }
    }
  });
};

loadContents().then(function () {
  setTimeout(function () {
    document.querySelector('#loading-screen').style.display = "none";
  }, 1000);
  setInterval(function _callee6() {
    var data, key, _gotData2;

    return regeneratorRuntime.async(function _callee6$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _context17.next = 2;
            return regeneratorRuntime.awrap(getUserList());

          case 2:
            data = _context17.sent;
            _context17.t0 = regeneratorRuntime.keys(data);

          case 4:
            if ((_context17.t1 = _context17.t0()).done) {
              _context17.next = 12;
              break;
            }

            key = _context17.t1.value;
            _context17.next = 8;
            return regeneratorRuntime.awrap(getUserProfileData({
              '_id': key
            }));

          case 8:
            _gotData2 = _context17.sent;

            if (data[key]["shouldShow"]) {
              (function () {
                var status = document.querySelector("#recent li[data-user-id='".concat(key, "'] .user-status"));
                ['user-status-offline', 'user-status-online'].forEach(function (element) {
                  if (status.classList.contains(element)) status.classList.remove(element);
                });
                var o = _gotData2[0]["online"] ? 'user-status-online' : "user-status-offline";
                status.classList.add(o);
                var lastSeen = _gotData2[0]["online"] ? "" : Boolean(_gotData2[0]["lastSeen"]) ? _gotData2[0]["lastSeen"] : 'Can\'t See';
                document.querySelector("#recent li[data-user-id='".concat(key, "'] .user-time > p")).innerText = lastSeen;
              })();
            }

            _context17.next = 4;
            break;

          case 12:
          case "end":
            return _context17.stop();
        }
      }
    });
  }, 10000);
});
socket.on('messageRecieve', function _callee7(data) {
  var removable, realNoti;
  return regeneratorRuntime.async(function _callee7$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          lastKnownScroll[data["senderId"]]++;
          _context18.next = 3;
          return regeneratorRuntime.awrap(getUserProfileData({
            '_id': data["senderId"]
          }));

        case 3:
          messenger = _context18.sent;
          messenger = messenger[0];

          if (data["isNew"]) {
            _context18.next = 28;
            break;
          }

          removable = document.querySelector('#removable');

          if (!(removable.getAttribute('data-current-user') === messenger["id"])) {
            _context18.next = 12;
            break;
          }

          addMessageToChatBox({
            message: data["message"],
            user: 1
          }, {
            'name': messenger["name"],
            'picture': messenger["name"].charAt(0)
          }).then(function () {
            return sendUserToTop(messenger["id"]);
          });
          sendMessageReadReq(messenger["id"]);
          _context18.next = 26;
          break;

        case 12:
          _context18.next = 14;
          return regeneratorRuntime.awrap(getUserList());

        case 14:
          _context18.t0 = messenger["id"];

          if (_context18.sent[_context18.t0]["shouldShow"]) {
            _context18.next = 18;
            break;
          }

          _context18.next = 18;
          return regeneratorRuntime.awrap(addToRecentList(messenger["id"], messenger["name"], true, data["date"]));

        case 18:
          noti = document.querySelector("#recent-list > li[data-user-id='".concat(messenger["id"], "'] .notification"));
          notiNumber = document.querySelector("#recent-list > li[data-user-id='".concat(messenger["id"], "'] .notification-number"));
          _context18.next = 22;
          return regeneratorRuntime.awrap(getNotification(messenger["id"]));

        case 22:
          realNoti = _context18.sent;
          notiNumber.innerHTML = realNoti;
          noti.classList.add('notification-active');
          sendUserToTop(messenger["id"]);

        case 26:
          _context18.next = 29;
          break;

        case 28:
          addToRecentList(messenger["id"], messenger["name"]);

        case 29:
          ringTone.play();

        case 30:
        case "end":
          return _context18.stop();
      }
    }
  });
});
socket.on('error', function _callee8() {
  return regeneratorRuntime.async(function _callee8$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          document.querySelector('#error').style.display = 'flex';

        case 1:
        case "end":
          return _context19.stop();
      }
    }
  });
});