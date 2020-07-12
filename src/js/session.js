import {gun} from './main.js';
import helpers from './helpers.js';
import {addFriend, newFriend } from './friend.js';

var key;
var username;
var latestChatLink;

//Create new account
function newAccount() {
    $('#username').focus();
    $('#account-create').submit(function(e) {
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
        $('.thisUser').text(username);
        
    });
    
    iris.Channel.getChannels(gun, key, addFriend);
    var chatId = helpers.getUrlParameter('chatWith') || helpers.getUrlParameter('channelId');
    var inviter = helpers.getUrlParameter('inviter');
    function go() {
        if (inviter !== key.pub) {
            newFriend(chatId, window.location.href);
        }
        window.history.pushState({}, "Friend", "/"+window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]); // remove param
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
        newAccount();
    }

    
    $('#account-login input').on('input', (event) => {
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
    $('#account-logout').click(() => {
        console.log(getUsername(), ": LOGGED OUT!")
        localStorage.removeItem('keyPair');
        location.reload();
    });
    
    $('#debug-print').click(() => {
        console.log("Username: ", getUsername());
        console.log("Key: ", JSON.stringify(getKey()));
        console.log("Friend Link: ", getFriendLink());
    });
}

export default {init, getKey, getUsername, getFriendLink};