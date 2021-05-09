const users = {};
const sortByUserId = {};

const convertDateToLastSeen = (current) => {
    let fromNow = current.fromNow();
    let lastSeen = 0;
    if (fromNow.includes('second')) {
        lastSeen = "Just now";
    } else if (fromNow.includes('year') || fromNow.includes('minute')) {
        lastSeen = fromNow;
    } else if (fromNow.includes('hour')) {
        lastSeen = current.format('h:mm a');
    } else if (fromNow.includes('day')) {
        if (fromNow.includes('a')) {
            lastSeen = 'Yesterday at ' + current.format('h:mm a');
        } else {
            lastSeen = current.format('MMMM do h:mm a');
        }
    } else {
        lastSeen = current.format('MMMM do h:mm a');
    }
    return lastSeen;
}

module.exports = {
    'users': users,
    'sortByUserId' : sortByUserId,
    'convertDateToLastSeen': convertDateToLastSeen
};