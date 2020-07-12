
import session from './session.js';
import friend from './friend.js';

//Gun instance created here
var gun = Gun(['https://mvp-gun.herokuapp.com/gun', 'https://e2eec.herokuapp.com/gun']);
session.init();
friend.init();



export {gun};