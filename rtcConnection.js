function rt(iceServerConfigs,paramaters){

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var personalVideoStream = null;
var rtcPeerConnection= null;
var t = true;

  if(navigator.getUserMedia) { 
    rtcPeerConnection= new RTCPeerConnection(iceServerConfigs);
    rtcPeerConnection.onicecandidate = onIceCandidateHandler;
    rtcPeerConnection.onaddstream = onAddStreamHandler;
   } else {alert("Your browser does not allow Real Time Connections!")
  }


this.Call = function(send) {
  if (t){getUserMedia(send);} t = false;
};
this.sdp = function(signal){    
  console.log("Received SDP from remote peer.");
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
}
this.candidate = function(signal){
console.log("Received ICECandidate from remote peer.");
rtcPeerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
}


function getUserMedia(local){
  navigator.getUserMedia(paramaters, function (stream) {
    personalVideoStream = stream;
    personalVideo.srcObject = personalVideoStream;
    rtcPeerConnection.addStream(personalVideoStream);
    if(local){Offer();}else{Answer();}
  }, function(error) { console.log(error);}); 
}

function Offer() {
  rtcPeerConnection.createOffer(
    function (offer) {
      var off = new RTCSessionDescription(offer);
      rtcPeerConnection.setLocalDescription(new RTCSessionDescription(off), 
        function() {
          websocket.offerAnswer(off);

        }, 
        function(error) { console.log(error);}
      );
    }, 
    function (error) { console.log(error);}
  );
};

function Answer() {
  rtcPeerConnection.createAnswer(
    function (answer) {
      var ans = new RTCSessionDescription(answer);
      rtcPeerConnection.setLocalDescription(ans, function() {
          websocket.offerAnswer(ans);

        }, 
        function (error) { console.log(error);}
      );
    },
    function (error) {console.log(error);}
  );
};

function onIceCandidateHandler(evt) {
  if (!evt || !evt.candidate) return;
  websocket.onIceCandidate(evt);
};

function onAddStreamHandler(evt) {
  guestVideo.srcObject = evt.stream;
};



}