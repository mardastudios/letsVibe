import {gun} from './main.js';
import helpers from './helpers.js';
import {addFriend, newFriend } from './friend.js';

let key;
let username;
let latestChatLink;
let onlineTimeout
let onlineStatus;

//Create new account
function createAccount() {
    $('#username').focus();
    $('#user-signup-form').submit(function(e) {
        e.preventDefault();
        var username = $('#username').val();
        if (username.length) {
            Gun.SEA.pair().then(async k => {
                await login(k);
                gun.user().get('profile').get('username').put(username);
                createFriendLink();
            });
        }
    });
}

function setOurOnlineStatus() {
    iris.Channel.setOnline(gun, onlineStatus = true);
    document.addEventListener("mousemove", () => {
      iris.Channel.setOnline(gun, onlineStatus = true);
      clearTimeout(onlineTimeout);
      onlineTimeout = setTimeout(() => iris.Channel.setOnline(gun, onlineStatus = false), 60000);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'visible') {
        iris.Channel.setOnline(gun, onlineStatus = true);
        if (activeChat) {
          chats[activeChat].setMyMsgsLastSeenTime();
          Notifications.changeChatUnseenCount(activeChat, 0);
        }
      } else {
        iris.Channel.setOnline(gun, onlineStatus = false);
      }
    });
  }
  
//Creating channel URL to be shared
async function createFriendLink() {
    latestChatLink = await iris.Channel.createChatLink(gun, key, 'http://localhost:8080');
}


//Login using a key
function login(k) {
    key = k;
    localStorage.setItem('keyPair', JSON.stringify(k));
    iris.Channel.initUser(gun, key);
    gun.user().get('profile').get('username').on(async name => {        
        username = await name;
        $('#my-username').text(username);
        
    });
    $('#vibe-page').show().siblings('div#init-page').hide();
    setOurOnlineStatus();
    iris.Channel.getChannels(gun, key, addFriend);
    var chatId = helpers.getUrlParameter('chatWith') || helpers.getUrlParameter('channelId');
    var inviter = helpers.getUrlParameter('inviter');
    function go() {
        if (inviter !== key.pub) {
            newFriend(chatId, window.location.href);
        }
        window.history.pushState({}, "VIBE", "/"+window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]); // remove param
    }
    if (chatId) {
        if (inviter) {
            setTimeout(go, 2000); // wait a sec to not re-create the same chat
        } else {
            go();
        }
    }
}

//Helper functions
function getKey() { return key;}
function getUsername() {return username;}
function getFriendLink() {return latestChatLink || helpers.getUserFriendLink(key.pub);}


function init() {
    var localStorageKey = localStorage.getItem('keyPair');
    if (localStorageKey) {
        console.log("ALREADY LOGGED IN")
        login(JSON.parse(localStorageKey));

    } else {
        console.log("NO ACCOUNT ACTIVE\n CREATE ONE");
        createAccount();
    }

    $('#goto-signin').on('click', function(){
        $('#sign-in').show().siblings('div#sign-up').hide();
    });

    $('#back-btn').on('click', function(){
        $('#sign-up').show().siblings('div#sign-in').hide();
    });

    $('#add-friend').on('click', function() {
        $('#add-friend-snippet1').show().siblings('div#add-friend-snippet0').hide();
    });

    $('#close_friend_add').on('click', function() {
        $('#add-friend-snippet0').show().siblings('div#add-friend-snippet1').hide();
    });

    $('#my-user-profile').on('click', function() {
        $('#settings-page').show().siblings('div#vibe-page').hide();
    });

    $('#go-back-vibe').on('click', function() {
        $('#vibe-page').show().siblings('div#settings-page').hide();
    });

    $('.profile-settings-btn').on('click', function() {
        $('#profile-settings').show().siblings('div#network-settings, div#audio-settings').hide();
    });
    
    $('.network-settings-btn').on('click', function() {
        $('#network-settings').show().siblings('div#profile-settings, div#audio-settings').hide();
    });
    
    $('.audio-settings-btn').on('click', function() {
        $('#audio-settings').show().siblings('div#network-settings, div#profile-settings').hide();
    });
    

    $('#priv-key').on('input', (event) => {
        var val = $(event.target).val();
        if (!val.length) {return;}
        try {
            var k = JSON.parse(val);
            login(k);
            createFriendLink();
            console.log('Succussfuly logged in');
            $(event.target).val('');
        } catch (e) {
            console.error('Login with key', val, 'failed', e);
            console.log('Error Logging in');
        }
    });
    $('#log-out-btn').click(() => {
        console.log(getUsername(), ": LOGGED OUT!")
        localStorage.removeItem('keyPair');
        location.reload();
    });
    
    $('#my-user-profile').click(() => {
        console.log("Username: ", getUsername());
        console.log("Key: ", JSON.stringify(getKey()));
        console.log("Friend Link: ", getFriendLink());
    });

    $('#my-link').click(() => {
        helpers.copyToClipboard(getFriendLink());
    })
}

export default {init, getKey, getUsername, getFriendLink};