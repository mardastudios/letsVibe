import {friends} from './friend.js';

var ourIceCandidates;
var userMediaStream;
var localAudio = $('.localAudio');
var remoteAudio = $('.remoteAudio');


async function addStreamtoPeerConnection(pc) {
    var constraints = { audio: true, video: false};
    userMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    userMediaStream.getTracks().forEach(track => {
        pc.addTrack(track, userMediaStream);
    });
    localAudio[0].srcObject = userMediaStream;
    localAudio[0].onloadedmetadata = function() {
        localAudio[0].play()
    }
}

function onCallMessage(pub, call) {
  if (call.offer) {
    console.log("incomming call from ", pub, call);
    $('.call_answer').click(async () => await initConnection(false, pub));
    $('.call_reject').click(() => friends[pub].put('call', null));
  }
}

async function callUser(pub) {
    
    await initConnection(true, pub);
    console.log('Calling', pub);

    var call = () => friends[pub].put('call', {
        time: new Date().toISOString(),
        type: 'voice',
        offer: true,
    });
    call();
}

async function initConnection(createOffer, pub) {
    ourIceCandidates = {};
    const theirIceCandidateKeys = [];
    friends[pub].pc = new RTCPeerConnection({iceServers: [ { urls: ["stun:turn.hepic.tel"] }, { urls: ["stun:stun.l.google.com:19302"] } ]});
    await addStreamtoPeerConnection(friends[pub].pc);
    async function createOfferFn() {
        try {
          if (friends[pub].isNegotiating) { return; }
          friends[pub].isNegotiating = true;
          var offer = await friends[pub].pc.createOffer();
          friends[pub].pc.setLocalDescription(offer);
          friends[pub].put('sdp', {time: new Date().toISOString(), data: offer});
        } finally {
          friends[pub].isNegotiating = false;
        }
    }
    if (createOffer) {
        await createOfferFn();
    }
    friends[pub].onTheir('sdp', async sdp => {
        if (!friends[pub].pc) { return; }
        if (friends[pub].pc.signalingState === 'stable') { return; }
        if (sdp.data && sdp.time && new Date(sdp.time) < (new Date() - 5000)) { return; }
        
        friends[pub].pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log('got their sdp', sdp);
      });
      friends[pub].onTheir('icecandidates', c => {
        if (!friends[pub].pc || friends[pub].pc.signalingState === 'closed') { return; }
        if (c.data && c.time && new Date(c.time) < (new Date() - 5000)) { return; }
        console.log('got their icecandidates', c);
        Object.keys(c.data).forEach(k => {
          if (theirIceCandidateKeys.indexOf(k) === -1) {
            theirIceCandidateKeys.push(k);
            friends[pub].pc.addIceCandidate(new RTCIceCandidate(c.data[k]));
          }
        });
      });
      friends[pub].pc.onicecandidate = friends[pub].pc.onicecandidate || (({candidate}) => {
        if (!candidate) return;
        console.log('sending our ice candidate');
        var i = Gun.SEA.random(12).toString('base64');
        ourIceCandidates[i] = candidate;
        friends[pub].put('icecandidates', {time: new Date().toISOString(), data: ourIceCandidates});
      });
      if (createOffer) {
        friends[pub].pc.onnegotiationneeded = async () => {
          createOfferFn();
        };
      }
      friends[pub].pc.onsignalingstatechange = async () => {
        if (!friends[pub].pc) { return; }
        console.log(
          "Signaling State Change:" + friends[pub].pc,
          friends[pub].pc.signalingState
        );
        switch (friends[pub].pc.signalingState) {
          case "have-remote-offer":
            var answer = await friends[pub].pc.createAnswer({
              offerToReceiveAudio: 1,
            });
            friends[pub].pc.setLocalDescription(answer);
            friends[pub].put('sdp', {time: new Date().toISOString(), data: answer});
            break;
          case "stable":
            console.log('call answered by', pub);
            break;
          case "closed":
            console.log("Signalling state is 'closed'");
            break;
        }
      };
      friends[pub].pc.onconnectionstatechange = () => {
        console.log('iceConnectionState changed', friends[pub].pc.iceConnectionState);
        switch (friends[pub].pc.iceConnectionState) {
          case "connected":
            break;
          case "disconnected":
            break;
          case "new":
            break;
          case "failed":
            break;
          case "closed":
            break;
          default:
            console.log("Change of state", friends[pub].pc.iceConnectionState);
            break;
        }
      };
      friends[pub].pc.ontrack = (event) => {
        console.log('ontrack', event);
        if (remoteAudio[0].srcObject !== event.streams[0]) {
          remoteAudio[0].srcObject = event.streams[0];
          remoteAudio[0].onloadedmetadata = function() {
            console.log('metadata loaded');
            remoteAudio[0].play();
          };
          console.log('received remote stream', event);
        }
      };
}


export default {
    callUser,
    onCallMessage
}