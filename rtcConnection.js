// Last update: 9/18/2019
//
// _________________________
// ModularRTC v1.1
//
//  https://github.com/DanielLauziere/modular-webRTC
//
// --------------------------------------------------
// Daniel Lauziere
// --------------------------------------------------
//
// WebRTC broken down into managable modules that can
// be used independently of each other based on the 
// needs of the client. Differents siganling methiods,
// stream requirements, connection settings and 
// hybrid shell methods for languages like C#, Java...
//
function rt(iceServerConfigs,paramaters){

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var personalVideoStream = null;
var rtcPeerConnection= null;
var t = true;
/** Chaeck for browser compatability */
  if(navigator.getUserMedia) { 
    rtcPeerConnection= new RTCPeerConnection(iceServerConfigs);
    rtcPeerConnection.onicecandidate = onIceCandidateHandler;
    rtcPeerConnection.onaddstream = onAddStreamHandler;
    rtcPeerConnection.oniceconnectionstatechange = function() {
      if(rtcPeerConnection.iceConnectionState == 'disconnected' ) {
        document.location.reload(false)
      }
  }
   } else {alert("Your browser does not allow Real Time Connections!")}
/** Create first call and allow callback from signaling.js */
this.Call = function(send) {
  if (t){getUserMedia(send);} t = false;
};
/** Callback from signaling.js  */
this.sdp = function(signal){    
  console.log("Received SDP from remote peer.");
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
}
/** Callback from signaling.js  */
this.candidate = function(signal){
console.log("Received ICECandidate from remote peer.");
rtcPeerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
}
/** Get user media method - Use for offer and answer  */
function getUserMedia(local){
  navigator.getUserMedia(paramaters, function (stream) {
    personalVideoStream = stream;
    personalVideo.srcObject = personalVideoStream;
    rtcPeerConnection.addStream(personalVideoStream);
    if(local){Offer();}else{Answer();}
  }, function(error) { console.log(error);}); 
}
/** creat and send offer to peer */
function Offer() {
  rtcPeerConnection.createOffer( function (offer) { var off = new RTCSessionDescription(offer);
      rtcPeerConnection.setLocalDescription(new RTCSessionDescription(off), function() { websocket.offerAnswer(off);}, function(error) { console.log(error);});}, function (error) { console.log(error);});
};
/** Answer peers offer with answer */
function Answer() {
  rtcPeerConnection.createAnswer(function (answer) { var ans = new RTCSessionDescription(answer); 
    rtcPeerConnection.setLocalDescription(ans, function() {  websocket.offerAnswer(ans); }, function (error) { console.log(error);}); },function (error) {console.log(error);} );
};
/** if evt.candidate is not undefined -> send event to peer */
function onIceCandidateHandler(evt) {
  if (!evt || !evt.candidate) return;
  websocket.onIceCandidate(evt);
};
/** Add guests video to the guestVideo html video element */
function onAddStreamHandler(evt) {
  guestVideo.srcObject = evt.stream;
};
}