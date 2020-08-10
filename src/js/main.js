
import session from './session.js';
import friend from './friend.js';
import avatar from './avatar.js';

Gun.log.off = true;
//Gun instance created here
var gun = Gun(['https://gun-eu.herokuapp.com/gun', 'https://dletta.rig.airfaas.com/gun']);
window.gun = gun;

//DEPRECIATED

// var cursor = $('.control-cursor');
// $(".audio-position-control").on('mousemove', function(e) {
//     var x = e.clientX;
//     var y = e.clientY;
//     cursor.css("left", (x + "px"));
//     cursor.css("top", (y +  "px"));
// });

// $(".audio-position-control").on('mousedown', function(e) {

//     var stamp = $('<div class="audio-stamp" style="position: relative; width: 1rem; height: 1rem; border: none; background-color: #f2f2f2; border-radius: 50%"></div>');
//     var room_control = $(this).find('.control-cursor').attr('id');

//     console.log(room_control)


//     stamp.css('left', (e.clientX + "px"));
//     stamp.css('top', (e.clientY + "px"));

//     var crdnt = e.clientX + "px" + ", " + e.clientY;


//     if ($(this).hasClass('audio-stamp')) {
//         console.log("IF")
//         $(this).remove($(this).find('.audio-stamp'));
//         $(this).append(stamp);
//     } else {
//         console.log("ELSE")
//         console.log($(this))
//         $(this).append(stamp);
//         console.log($(this))
 
//         $(this).find('#room-position').text(crdnt);
//     }
    
// });

session.init();
friend.init();
avatar.init();

export {gun};