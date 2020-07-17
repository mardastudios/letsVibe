import session from './session.js';
import {gun} from './main.js';
import helpers from './helpers.js';
import vibe from './vibe.js';

var friends = window.friends = {};

//Create a channel
function newFriend(pub, friendLink) {
    if (!pub || Object.prototype.hasOwnProperty.call(friends, pub)) {
        return;
    }

    const channel = new iris.Channel({gun, key: session.getKey(), chatLink: friendLink, participants: pub});
    addFriend(channel);
}

//Add the channel to friends[pub]
function addFriend(channel) {
    var pub = channel.getId();
    var element = $('<div> </div>');
    var callButton = $('<button class="callButton" >Call</button>');

    if (friends[pub]) {return;}
    friends[pub] = channel;
    element.attr('user-pub',pub);
    gun.user(pub).get('profile').get('username').on(async username => {
        friends[pub].username = await username;
        element.text(friends[pub].username);
        console.log(friends[pub].username);
    });
    callButton.click(() => vibe.callUser(friends[pub].participants));
    $('.user-list').append(element).append(callButton);
    friends[pub].onTheir('call', call => vibe.onCallMessage(pub, call));

}

//Listen for paste function and create channel
function onPasteFriendLink(event) {
    var val =  $(event.target).val();
    if (val.length < 30) { return; }
    var s = val.split('?'); 
    if (s.length !==2) { return; }
    var friendId = helpers.getUrlParameter('chatWith', s[1]) || helpers.getUrlParameter('channelId', s[1]);

    if (friendId) {
        newFriend(friendId, val);
    }
    console.log("Successfully shared");
    $(event.target).val('');
}

function init() {
    $("#paste-friend-link").on('input', onPasteFriendLink);
    

}

export {init, addFriend, newFriend, friends}
export default {init, addFriend, newFriend, friends}
