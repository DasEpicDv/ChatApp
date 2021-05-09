const socket = io();
let ticking = false;
let lastKnownScroll = {};
let canScrollMore = {};

let ringTone = new Audio('./static/Sounds/ringtone.mp3');

let previouslyLoadedMessages = {};
let myProfile = {};

const getProfileData = async () => {
    const rawResponse = await fetch('/requests/profile', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    let data = await rawResponse.json();
    return data;
}

const getNotification = async (id) => {
    const rawResponse = await fetch('/requests/getNotification', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'id': id })
    });
    let data = await rawResponse.json();
    return data["notification"];
}

const sendMessageReadReq = (id) => {
    fetch('/requests/messageRead', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'id': id })
    });
}

const sendUserToTop = (id) => {
    li = document.querySelector(`#recent-list > li[data-user-id='${id}']`);
    li.remove();
    document.querySelector("#recent-list").append(li);
}

const enterMessageFunc = async (e) => {
    const messageInputForm = document.querySelector('#message-input-form');
    if (messageInputForm.value !== "") {
        const id = document.querySelector('#removable').getAttribute('data-current-user');
        sendUserToTop(id);

        const data = myProfile;
        const date = new Date();
        let hour = 0;
        if (date.getHours() > 11 && date.getMinutes() > 59) {
            hour = date.getHours() + ":" + date.getMinutes() + " am"
        } else {
            hour = date.getHours() - 12 + ":" + date.getMinutes() + " pm"
        }
        const message = messageInputForm.value;
        addMessageToChatBox({ 'message': message, user: 0, date: `${hour}` }, { 'picture': data["name"].charAt(0) });
        messageInputForm.value = "";
        socket.emit('sendMessage', { 'id': id, 'message': message });
    }
}



const getUserList = async () => {
    const rawResponse = await fetch('/requests/getPeopleList', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    let data = await rawResponse.json();
    return data;
}

const addToUserList = async (id, s) => {
    const rawResponse = await fetch('/requests/addToPeopleList', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'id': id })
    });
    let data = await rawResponse.json();
    return data;
}

const getUserProfileData = async (type) => {
    const rawResponse = await fetch('/requests/getuser', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "body": JSON.stringify({ type: type })
    });
    let data = await rawResponse.json();
    return data;
}

const getMessagesOfUser = async (userId, max = 11, min = 1) => {
    const rawResponse = await fetch('/requests/getModifiedMessage', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'id': userId, 'max': max, 'min': min })
    });
    let data = await rawResponse.json();
    return data;
}

const addToRecentList = async (id, name, online, lastSeen) => {
    let li = document.createElement('li');
    let status = online ? 'user-status-online' : "user-status-offline";
    li.setAttribute('data-user-id', id);
    li.setAttribute('data-user-name', name);
    date = new Date();
    let noti = await getNotification(id);
    let notiClass = `<span class="notification"><p class="notification-number">0</p></span>`;
    if (noti > 0) {
        notiClass = `<span class="notification notification-active"><p class="notification-number">${noti}</p></span>`;
    }
    lastSeen = online ? "" : Boolean(lastSeen) ? lastSeen : 'Can\'t See';
    li.innerHTML = `<div class="user-container">
                        <div class="chat-user-img align-self-center mr-3 avatar-xs">
                            ${notiClass}
                            <span class="user-icon rounded-circle bg-soft-primary text-primary">${name.charAt(0)}</span>
                            <span class="user-status ${status}"></span>
                        </div>
                        <div class="user-pr">
                            <h5 class="user-name text-truncate">${name}</h5>
                        </div>
                        <div class="user-time">
                            <p>${lastSeen}</p>
                        </div>
                    </div>`
    document.querySelector('#recent-list').append(li);
    return;
};

const addMessageToChatBox = async (textMessage, userData, before = false) => {
    const chatBox = document.querySelector('.chat-box');
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
    return;
}

const loadContents = async () => {
    let data = await getProfileData();
    socket.emit('user-connected', data);
    myProfile = {
        'id': data["id"],
        'name': data["name"],
        'email': data["email"],
        'description': data["description"],
        'created': data["created"]
    };
    document.querySelector("#add-name").innerText = data["name"];


    const logos = document.querySelectorAll('#middle > .logo');
    logos.forEach(element => {
        element.addEventListener('click', (e) => {
            const theFor = e.currentTarget.getAttribute('data-for');
            const classes = document.querySelectorAll(`.${theFor}`);
            let oldActive = document.querySelector('.logo-active');
            if (oldActive) {
                oldActive.classList.remove('logo-active');
                let oldFor = oldActive.getAttribute('data-for');
                const oldClasses = document.querySelectorAll(`.${oldFor}`);
                oldClasses.forEach(element => {
                    element.style.display = 'none';
                });
            }
            classes.forEach(element => {
                element.style.display = 'block';
            });
            e.currentTarget.classList.add('logo-active');
            if (e.currentTarget.getAttribute("data-for") === "for-settings" || e.currentTarget.getAttribute("data-for") === "for-profile"){
                document.querySelector(`.${e.currentTarget.getAttribute("data-for")} #add-name`).innerText = myProfile["name"];
                document.querySelector(`.${e.currentTarget.getAttribute("data-for")} #add-description`).innerText = myProfile["description"];
            }
        });
    });

    document.querySelectorAll('.dropdown-card').forEach(element => {
        element.addEventListener('click', async (e) => {
            if (e.target.nodeName === "I") {
                const content = e.currentTarget.nextElementSibling;
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
                    let obj = [myProfile['name'], myProfile['email'], myProfile['created']];
                    $i = 0;
                    e.target.parentNode.nextElementSibling.firstElementChild.childNodes.forEach(element => {
                        if (element.nodeName === "DIV"){
                            element.lastElementChild.innerText = obj[$i];
                            $i++;
                        }
                    });
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            }
        });
    })

    document.querySelector('#rest').addEventListener('keypress', (e) => {
        if (e.target.id = "message-input-form") {
            if (e.keyCode === 13) {
                e.preventDefault();
                enterMessageFunc();
            }
        }
    });


    document.querySelector('#rest').addEventListener('click', (e) => {
        let btn = document.querySelector('#enter-btn');
        if (e.target.id === 'enter-btn' || (btn && btn.contains(e.target))) {
            enterMessageFunc();
        } else if (e.target.nodeName = "SPAN" && e.target.parentNode.classList.contains('emojis')) {
            const messageInputForm = document.querySelector('#message-input-form');
            messageInputForm.value = messageInputForm.value + e.target.innerText;
        } else if (e.target.classList.contains('return-btn')) {
            e.currentTarget.style.transform = "translateX(100%)";
        }
    });

    data = await getUserList();
    for (const key in data) {
        const gotData = await getUserProfileData({ '_id': key });
        if (data[key]["shouldShow"]) {
            addToRecentList(key, gotData[0]["name"], gotData[0]['online'], gotData[0]['lastSeen']);
        }
    }

    document.querySelector("#recent-list").addEventListener('click', async (e) => {
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
        if (e.target && a.nodeName == "LI") {
            li = a;
            const toUserId = li.getAttribute('data-user-id');


            const toName = li.getAttribute('data-user-name');
            li.classList.add("user-active");

            let active = document.querySelector('.user-active');
            if (active) active.classList.remove('user-active');
            active = document.querySelector(`#recent-list > li[data-user-id='${toUserId}'] .notification-active`);
            if (active) {
                sendMessageReadReq(toUserId);
                active.classList.remove('notification-active');
            };

            const myinfo = await getProfileData();
            const theirInfo = (await getUserProfileData({ '_id': toUserId }))[0];
            let online = theirInfo["online"] ? 'user-status-online' : "user-status-offline";
            document.querySelector('#removable').setAttribute('data-current-user', toUserId);
            document.querySelector('#removable').innerHTML = `<div id="chat-onTop" class="p-3 p-lg-4 border-bottom">
                    <div id="chat-onTopItems">
                        <div id="chat-onTop-profile" class="col-sm-4 col-8">
                            <span class="dropdown-card-arrow return-btn">chevron_left</span>
                            <div class="chat-user-img align-self-center mr-3 avatar-xs">
                                <span class="user-icon rounded-circle bg-soft-primary text-primary">${theirInfo["name"].charAt(0)}</span>
                                <span class="user-status ${online}"></span>
                            </div>
                            <div style="overflow: hidden;">
                                <p class="user-name text-truncate">${theirInfo["name"]}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chat-box">

                </div>
                <div class="chat-enter p-3 p-lg-4 border-top mb-0">
                <textarea id="message-input-form" placeholder="Type Message" class="form-control form-control-lg bg-light border-light rounded" style="min-height: 20px; padding-left: 12px;"></textarea>
                <div class="chat-btn-area">
                    <div  id="emoji-btn">
                        <button class="pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-emoji-smile" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                            </svg>
                            <div id="inner" style="cursor: default;">
                                <div id="search">
                                    <input type="text" class="form-control" id="autoSizingInputGroup" placeholder="Search for Emoji">
                                </div>
                                <div id="emoji-list">
                                    <div class="emoji-category">
                                        <h5>PEOPLE</h5>
                                        <div class="emojis">
                                            <span title="smile">😄</span><span data-v-1cd1a04e="" title="smiley">😃</span><span data-v-1cd1a04e="" title="grinning">😀</span><span data-v-1cd1a04e="" title="blush">😊</span><span data-v-1cd1a04e="" title="wink">😉</span><span data-v-1cd1a04e="" title="heart_eyes">😍</span><span data-v-1cd1a04e="" title="kissing_heart">😘</span><span data-v-1cd1a04e="" title="kissing_closed_eyes">😚</span><span data-v-1cd1a04e="" title="kissing">😗</span><span data-v-1cd1a04e="" title="kissing_smiling_eyes">😙</span><span data-v-1cd1a04e="" title="stuck_out_tongue_winking_eye">😜</span><span data-v-1cd1a04e="" title="stuck_out_tongue_closed_eyes">😝</span><span data-v-1cd1a04e="" title="stuck_out_tongue">😛</span><span data-v-1cd1a04e="" title="flushed">😳</span><span data-v-1cd1a04e="" title="grin">😁</span><span data-v-1cd1a04e="" title="pensive">😔</span><span data-v-1cd1a04e="" title="relieved">😌</span><span data-v-1cd1a04e="" title="unamused">😒</span><span data-v-1cd1a04e="" title="disappointed">😞</span><span data-v-1cd1a04e="" title="persevere">😣</span><span data-v-1cd1a04e="" title="cry">😢</span><span data-v-1cd1a04e="" title="joy">😂</span><span data-v-1cd1a04e="" title="sob">😭</span><span data-v-1cd1a04e="" title="sleepy">😪</span><span data-v-1cd1a04e="" title="disappointed_relieved">😥</span><span data-v-1cd1a04e="" title="cold_sweat">😰</span><span data-v-1cd1a04e="" title="sweat_smile">😅</span><span data-v-1cd1a04e="" title="sweat">😓</span><span data-v-1cd1a04e="" title="weary">😩</span><span data-v-1cd1a04e="" title="tired_face">😫</span><span data-v-1cd1a04e="" title="fearful">😨</span><span data-v-1cd1a04e="" title="scream">😱</span><span data-v-1cd1a04e="" title="angry">😠</span><span data-v-1cd1a04e="" title="rage">😡</span><span data-v-1cd1a04e="" title="triumph">😤</span><span data-v-1cd1a04e="" title="confounded">😖</span><span data-v-1cd1a04e="" title="laughing">😆</span><span data-v-1cd1a04e="" title="yum">😋</span><span data-v-1cd1a04e="" title="mask">😷</span><span data-v-1cd1a04e="" title="sunglasses">😎</span><span data-v-1cd1a04e="" title="sleeping">😴</span><span data-v-1cd1a04e="" title="dizzy_face">😵</span><span data-v-1cd1a04e="" title="astonished">😲</span><span data-v-1cd1a04e="" title="worried">😟</span><span data-v-1cd1a04e="" title="frowning">😦</span><span data-v-1cd1a04e="" title="anguished">😧</span><span data-v-1cd1a04e="" title="imp">👿</span><span data-v-1cd1a04e="" title="open_mouth">😮</span><span data-v-1cd1a04e="" title="grimacing">😬</span><span data-v-1cd1a04e="" title="neutral_face">😐</span><span data-v-1cd1a04e="" title="confused">😕</span><span data-v-1cd1a04e="" title="hushed">😯</span><span data-v-1cd1a04e="" title="smirk">😏</span><span data-v-1cd1a04e="" title="expressionless">😑</span><span data-v-1cd1a04e="" title="man_with_gua_pi_mao">👲</span><span data-v-1cd1a04e="" title="man_with_turban">👳</span><span data-v-1cd1a04e="" title="cop">👮</span><span data-v-1cd1a04e="" title="construction_worker">👷</span><span data-v-1cd1a04e="" title="guardsman">💂</span><span data-v-1cd1a04e="" title="baby">👶</span><span data-v-1cd1a04e="" title="boy">👦</span><span data-v-1cd1a04e="" title="girl">👧</span><span data-v-1cd1a04e="" title="man">👨</span><span data-v-1cd1a04e="" title="woman">👩</span><span data-v-1cd1a04e="" title="older_man">👴</span><span data-v-1cd1a04e="" title="older_woman">👵</span><span data-v-1cd1a04e="" title="person_with_blond_hair">👱</span><span data-v-1cd1a04e="" title="angel">👼</span><span data-v-1cd1a04e="" title="princess">👸</span><span data-v-1cd1a04e="" title="smiley_cat">😺</span><span data-v-1cd1a04e="" title="smile_cat">😸</span><span data-v-1cd1a04e="" title="heart_eyes_cat">😻</span><span data-v-1cd1a04e="" title="kissing_cat">😽</span><span data-v-1cd1a04e="" title="smirk_cat">😼</span><span data-v-1cd1a04e="" title="scream_cat">🙀</span><span data-v-1cd1a04e="" title="crying_cat_face">😿</span><span data-v-1cd1a04e="" title="joy_cat">😹</span><span data-v-1cd1a04e="" title="pouting_cat">😾</span><span data-v-1cd1a04e="" title="japanese_ogre">👹</span><span data-v-1cd1a04e="" title="japanese_goblin">👺</span><span data-v-1cd1a04e="" title="see_no_evil">🙈</span><span data-v-1cd1a04e="" title="hear_no_evil">🙉</span><span data-v-1cd1a04e="" title="speak_no_evil">🙊</span><span data-v-1cd1a04e="" title="skull">💀</span><span data-v-1cd1a04e="" title="alien">👽</span><span data-v-1cd1a04e="" title="hankey">💩</span><span data-v-1cd1a04e="" title="fire">🔥</span><span data-v-1cd1a04e="" title="sparkles">✨</span><span data-v-1cd1a04e="" title="star2">🌟</span><span data-v-1cd1a04e="" title="dizzy">💫</span><span data-v-1cd1a04e="" title="boom">💥</span><span data-v-1cd1a04e="" title="anger">💢</span><span data-v-1cd1a04e="" title="sweat_drops">💦</span><span data-v-1cd1a04e="" title="droplet">💧</span><span data-v-1cd1a04e="" title="zzz">💤</span><span data-v-1cd1a04e="" title="dash">💨</span><span data-v-1cd1a04e="" title="ear">👂</span><span data-v-1cd1a04e="" title="eyes">👀</span><span data-v-1cd1a04e="" title="nose">👃</span><span data-v-1cd1a04e="" title="tongue">👅</span><span data-v-1cd1a04e="" title="lips">👄</span><span data-v-1cd1a04e="" title="thumbs_up">👍</span><span data-v-1cd1a04e="" title="-1">👎</span><span data-v-1cd1a04e="" title="ok_hand">👌</span><span data-v-1cd1a04e="" title="facepunch">👊</span><span data-v-1cd1a04e="" title="fist">✊</span><span data-v-1cd1a04e="" title="wave">👋</span><span data-v-1cd1a04e="" title="hand">✋</span><span data-v-1cd1a04e="" title="open_hands">👐</span><span data-v-1cd1a04e="" title="point_up_2">👆</span><span data-v-1cd1a04e="" title="point_down">👇</span><span data-v-1cd1a04e="" title="point_right">👉</span><span data-v-1cd1a04e="" title="point_left">👈</span><span data-v-1cd1a04e="" title="raised_hands">🙌</span><span data-v-1cd1a04e="" title="pray">🙏</span><span data-v-1cd1a04e="" title="clap">👏</span><span data-v-1cd1a04e="" title="muscle">💪</span><span data-v-1cd1a04e="" title="walking">🚶</span><span data-v-1cd1a04e="" title="runner">🏃</span><span data-v-1cd1a04e="" title="dancer">💃</span><span data-v-1cd1a04e="" title="couple">👫</span><span data-v-1cd1a04e="" title="family">👪</span><span data-v-1cd1a04e="" title="couplekiss">💏</span><span data-v-1cd1a04e="" title="couple_with_heart">💑</span><span data-v-1cd1a04e="" title="dancers">👯</span><span data-v-1cd1a04e="" title="ok_woman">🙆</span><span data-v-1cd1a04e="" title="no_good">🙅</span><span data-v-1cd1a04e="" title="information_desk_person">💁</span><span data-v-1cd1a04e="" title="raising_hand">🙋</span><span data-v-1cd1a04e="" title="massage">💆</span><span data-v-1cd1a04e="" title="haircut">💇</span><span data-v-1cd1a04e="" title="nail_care">💅</span><span data-v-1cd1a04e="" title="bride_with_veil">👰</span><span data-v-1cd1a04e="" title="person_with_pouting_face">🙎</span><span data-v-1cd1a04e="" title="person_frowning">🙍</span><span data-v-1cd1a04e="" title="bow">🙇</span><span data-v-1cd1a04e="" title="tophat">🎩</span><span data-v-1cd1a04e="" title="crown">👑</span><span data-v-1cd1a04e="" title="womans_hat">👒</span><span data-v-1cd1a04e="" title="athletic_shoe">👟</span><span data-v-1cd1a04e="" title="mans_shoe">👞</span><span data-v-1cd1a04e="" title="sandal">👡</span><span data-v-1cd1a04e="" title="high_heel">👠</span><span data-v-1cd1a04e="" title="boot">👢</span><span data-v-1cd1a04e="" title="shirt">👕</span><span data-v-1cd1a04e="" title="necktie">👔</span><span data-v-1cd1a04e="" title="womans_clothes">👚</span><span data-v-1cd1a04e="" title="dress">👗</span><span data-v-1cd1a04e="" title="running_shirt_with_sash">🎽</span><span data-v-1cd1a04e="" title="jeans">👖</span><span data-v-1cd1a04e="" title="kimono">👘</span><span data-v-1cd1a04e="" title="bikini">👙</span><span data-v-1cd1a04e="" title="briefcase">💼</span><span data-v-1cd1a04e="" title="handbag">👜</span><span data-v-1cd1a04e="" title="pouch">👝</span><span data-v-1cd1a04e="" title="purse">👛</span><span data-v-1cd1a04e="" title="eyeglasses">👓</span><span data-v-1cd1a04e="" title="ribbon">🎀</span><span data-v-1cd1a04e="" title="closed_umbrella">🌂</span><span data-v-1cd1a04e="" title="lipstick">💄</span><span data-v-1cd1a04e="" title="yellow_heart">💛</span><span data-v-1cd1a04e="" title="blue_heart">💙</span><span data-v-1cd1a04e="" title="purple_heart">💜</span><span data-v-1cd1a04e="" title="green_heart">💚</span><span data-v-1cd1a04e="" title="broken_heart">💔</span><span data-v-1cd1a04e="" title="heartpulse">💗</span><span data-v-1cd1a04e="" title="heartbeat">💓</span><span data-v-1cd1a04e="" title="two_hearts">💕</span><span data-v-1cd1a04e="" title="sparkling_heart">💖</span><span data-v-1cd1a04e="" title="revolving_hearts">💞</span><span data-v-1cd1a04e="" title="cupid">💘</span><span data-v-1cd1a04e="" title="love_letter">💌</span><span data-v-1cd1a04e="" title="kiss">💋</span><span data-v-1cd1a04e="" title="ring">💍</span><span data-v-1cd1a04e="" title="gem">💎</span><span data-v-1cd1a04e="" title="bust_in_silhouette">👤</span><span data-v-1cd1a04e="" title="speech_balloon">💬</span><span data-v-1cd1a04e="" title="footprints">👣</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <button class="pointer" id="enter-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
                            <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                    </button>
                </div>
            </div>`
            const myUserData = { 'name': myinfo["name"], 'picture': myinfo["name"].charAt(0) };
            const hisUserData = { 'name': theirInfo["name"], 'picture': theirInfo["name"].charAt(0) }
            let messages = {};
            if (previouslyLoadedMessages[toUserId]) {
                messages = previouslyLoadedMessages[toUserId];
            } else {
                gotData = await getMessagesOfUser(toUserId);
                lastKnownScroll[toUserId] = 11;
                if (gotData["end"]) { canScrollMore[toUserId] = false } else { canScrollMore[toUserId] = true }
                messages = gotData["messages"];
                previouslyLoadedMessages[toUserId] = messages;
            }

            messages.forEach(element => {
                let data = myUserData;
                if (element["user"] === 1) {
                    data = hisUserData;
                }
                addMessageToChatBox(element, data);
            });
            document.querySelector('.chat-box').addEventListener('scroll', (e) => {
                if (e.currentTarget.scrollTop == 0 && canScrollMore[document.querySelector('#removable').getAttribute('data-current-user')]) {
                    if (!ticking) {
                        window.requestAnimationFrame(async function () {
                            lks = lastKnownScroll[document.querySelector('#removable').getAttribute('data-current-user')];
                            let messages = await getMessagesOfUser(document.querySelector('#removable').getAttribute('data-current-user'), lks + 15, lks + 1);
                            if (messages["end"]) {
                                canScrollMore[document.querySelector('#removable').getAttribute('data-current-user')] = false;
                            }
                            const myinfo = await getProfileData();
                            const theirInfo = (await getUserProfileData({ '_id': document.querySelector('#removable').getAttribute('data-current-user') }))[0];
                            const myUserData = { 'name': myinfo["name"], 'picture': myinfo["name"].charAt(0) };
                            const hisUserData = { 'name': theirInfo["name"], 'picture': theirInfo["name"].charAt(0) }
                            previouslyLoadedMessages[document.querySelector('#removable').getAttribute('data-current-user')] = messages["messages"].concat(previouslyLoadedMessages[document.querySelector('#removable').getAttribute('data-current-user')]);
                            messages["messages"].reverse().forEach(element => {
                                let data = myUserData;
                                if (element["user"] === 1) {
                                    data = hisUserData;
                                }
                                addMessageToChatBox(element, data, true);
                            });
                            lastKnownScroll[document.querySelector('#removable').getAttribute('data-current-user')] += 15;
                            ticking = false;
                        });

                        ticking = true;
                    }
                }
            });
        }
        const rest = document.querySelector("#rest");
        rest.style.transform = "translateX(0%)";
    });

    const searchResultFunction = async (e) => {
        let users = [];
        if (e.currentTarget.value !== "") {
            users = await getUserProfileData({ 'name': { "$regex": e.currentTarget.value, "$options": "i" } });
        }
        const ul = document.querySelector(".search-box ul");
        ul.innerHTML = "";
        for (const key in users) {
            const data = users[key];
            ul.innerHTML = ul.innerHTML + `<li data-searches-id='${data["id"]}'>
                    <div class="user-container">
                        <div class="chat-user-img align-self-center mr-3 avatar-xs">
                            <span class="user-icon rounded-circle bg-soft-primary text-primary">${data["name"].charAt(0)}</span>
                        </div>
                        <div class="user-pr">
                            <h5 class="user-name text-truncate">${data["name"]}</h5>
                        </div>
                    </div>
                </li>`;
        }
    }

    document.querySelector(".search-box form input").addEventListener('input', searchResultFunction);
    document.querySelector(".search-box form input").addEventListener('focus', searchResultFunction);

    document.querySelector(".search-box ul").addEventListener('click', async (e) => {
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
        if (e.target && a.nodeName == "LI") {
            li = a;
            const opened = document.querySelector('#openedUser');
            const profile = (await getUserProfileData({ '_id': li.getAttribute('data-searches-id') }))[0];
            opened.innerHTML = `
                    <div class="content mx-auto my-auto">
                        <div class="p-3 p-lg-4 border-bottom">
                            <div class="items row">
                                <div class="profile col-sm-4 col-8">
                                    <div class="user-container" style="border-top: none;padding: 0;">
                                        <span class="dropdown-card-arrow return-btn">chevron_left</span>
                                        <div class="chat-user-img align-self-center mr-3 avatar-xs">
                                            <span class="user-icon rounded-circle bg-soft-primary text-primary">${profile["name"].charAt(0)}</span>
                                        </div>
                                        <div class="user-pr">
                                            <h5 class="user-name text-truncate">${profile["name"]}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-8 col-4 text-right">
                                    <button data-user-id='${profile["id"]}' class="btn btn-success send-btn">Send Message</button>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 31px;">
                            <div class="openedUser-info" style="display: flex; flex-direction: column;color: white;">
                                <p class="text-muted" style="font-size: 19px;text-align: center;">${profile["description"]}</p>
                            </div>
                        </div>
                    </div>
            `;
            opened.style.display = "flex";
        }
    });

    document.querySelector('#container').addEventListener('click', (e) => {
        const parent = document.querySelector(".search-box");
        if (!parent.contains(e.target)) {
            document.querySelector('.search-box ul').innerHTML = "";
        }
    });
    document.querySelector('#openedUser').addEventListener('click', async (e) => {
        if (e.target.classList.contains("send-btn") || e.target.classList.contains("return-btn")) {
            e.currentTarget.style.display = "none";
        }

        if (e.target.classList.contains("send-btn")) {
            let name = (await getUserProfileData({ '_id': e.target.getAttribute('data-user-id') }))[0]["name"];
            let returnedData = await addToUserList(e.target.getAttribute('data-user-id'));
            if (returnedData['alreadyIn']) {
                if (!(await getUserList())[e.target.getAttribute('data-user-id')]['shouldShow']) {
                    addToRecentList(e.target.getAttribute('data-user-id'), name);
                } else {
                    document.querySelector(`#recent li[data-user-id='${e.target.getAttribute('data-user-id')}']`).scrollIntoView({ 'behavior': 'smooth' })
                }
            } else {
                addToRecentList(e.target.getAttribute('data-user-id'), name);
            }
        }
    });
    return;
}

loadContents().then(() => {
    setTimeout(() => {
        document.querySelector('#loading-screen').style.display = "none";
    }, 1000)
    setInterval(async () => {
        const data = await getUserList();
        for (const key in data) {
            const gotData = await getUserProfileData({ '_id': key });
            if (data[key]["shouldShow"]) {
                let status = document.querySelector(`#recent li[data-user-id='${key}'] .user-status`);
                ['user-status-offline', 'user-status-online'].forEach(element => {
                    if (status.classList.contains(element)) status.classList.remove(element);
                });
                let o = gotData[0]["online"] ? 'user-status-online' : "user-status-offline";
                status.classList.add(o);
                let lastSeen = gotData[0]["online"] ? "" : Boolean(gotData[0]["lastSeen"]) ? gotData[0]["lastSeen"] : 'Can\'t See';
                document.querySelector(`#recent li[data-user-id='${key}'] .user-time > p`).innerText = lastSeen;
            }
        }
    }, 10000);
});

socket.on('messageRecieve', async (data) => {
    lastKnownScroll[data["senderId"]]++;
    messenger = await getUserProfileData({ '_id': data["senderId"] });
    messenger = messenger[0];
    if (!data["isNew"]) {
        const removable = document.querySelector('#removable');
        if (removable.getAttribute('data-current-user') === messenger["id"]) {
            addMessageToChatBox({ message: data["message"], user: 1 }, { 'name': messenger["name"], 'picture': messenger["name"].charAt(0) }).then(() => sendUserToTop(messenger["id"]));
            sendMessageReadReq(messenger["id"]);
        } else {
            if (!(await getUserList())[messenger["id"]]["shouldShow"]) {
                await addToRecentList(messenger["id"], messenger["name"], true, data["date"]);
            }
            noti = document.querySelector(`#recent-list > li[data-user-id='${messenger["id"]}'] .notification`);
            notiNumber = document.querySelector(`#recent-list > li[data-user-id='${messenger["id"]}'] .notification-number`);
            const realNoti = await getNotification(messenger["id"]);
            notiNumber.innerHTML = realNoti;
            noti.classList.add('notification-active');
            sendUserToTop(messenger["id"]);
        }
    } else {
        addToRecentList(messenger["id"], messenger["name"]);
    }
    ringTone.play();
});

socket.on('error', async () => {
    document.querySelector('#error').style.display = 'flex';
});