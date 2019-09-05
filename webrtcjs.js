/* browser dependent definition are aligned to one and the same standard name */
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;


var camerasList = [];
var audiosList = [];


var config = { wssHost: 'wss://gokmr.com:5002' };
var connected = false;
var localControlNumber = Date.now();
var remoteControlNumber = 0;
var resetTimes = 0;
var localNotRemote = null;

var localVideo = null, 
  remoteVideo = null, 
  localVideoStream = null,
  videoCallButton = null, 
  endCallButton = null;
  var peerConn = null,
  wsc = new WebSocket(config.wssHost),
  peerConnCfg = {'iceServers': [
    {
      'url': 'stun:stun.l.google.com:19302'
    }
      /*
    , 
    {
      
        //
        //  Add additional turn and stun server credentials  
        //

      'url': 'turn:100.100.100.100:3478?transport=udp',
      'credential': 'password',
      'username': 'username'
    },
    {
      'url': 'turn:100.100.100.100:3478?transport=udp',
      'credential': 'password',
      'username': 'username'
      
    }
    s*/
  ]
  };
    
function pageReady(){
  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');
  muteImage = document.getElementById('muteImage');
  function muteAudio() { 
    if (remoteVideo.muted){
      localStorage.setItem('alreadyMuted', "false");
      remoteVideo.muted = false;
      muteImage.style.display = "none";
    }
    else{
      localStorage.setItem('alreadyMuted', "true");
      remoteVideo.muted = true;
      muteImage.style.display = "block";
    }
  } 
  muteImage.addEventListener("click", muteAudio);
  remoteVideo.addEventListener("click", muteAudio);
document.getElementById('muteImage').addEventListener("click", muteAudio);




if(getSavedPrefs("alreadyMuted") == "true"){      
    remoteVideo.muted = true;
    muteImage.style.display = "block"; 
  }
else{
    remoteVideo.muted = false;
    muteImage.style.display = "none"; 
}


  //
  /* Enumerate camera choices ... add to select ...  */
  //
  var lastSelectedCameraIndex = getSavedPrefs("localCameraIndex");
  var lastSelectedMicrophoneIndex = getSavedPrefs("localMicrophoneIndex");

  /* audio and video selectes */
    var audioSelect = document.querySelector('select#audioSource');
    var videoSelect = document.querySelector('select#videoSource');
      navigator.mediaDevices.enumerateDevices().then(gotDevices).then(firstStream).catch(handleError);
    /* methods */
    videoSelect.onchange = getStream;
    audioSelect.onchange = getStream;
  function gotDevices(deviceInfos) {
    var option1 = document.createElement('option');
    option1.value = "";
    option1.text = "Choose a camera";
    videoSelect.appendChild(option1);
    camerasList.push("");
    var option = document.createElement('option');
    option.value = "";
    option.text = "Choose a microphone";
    audioSelect.appendChild(option);
    audiosList.push("");

    for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' +
        (videoSelect.length + 1);
        videoSelect.appendChild(option);
        camerasList.push(deviceInfo.deviceId);
      }
      else if (deviceInfo.kind === 'audioinput') {
        if (deviceInfo.lable != "Default" ||deviceInfo.lable != "Commnuications" ){
        option.text = deviceInfo.label ||
          'microphone ' + (audioSelect.length + 1);
        audioSelect.appendChild(option);
        audiosList.push(deviceInfo.deviceId);

        console.log((audiosList.length + 1) + " audio device is : "+deviceInfo.deviceId );
        }
      }
    }
    /* Set html select to proper video and audio device based on what the user used last time */
    try{videoSelect.selectedIndex = lastSelectedCameraIndex; }catch(err) {"Not able to select camera .. "+err}
    console.log("The last selected camera is: "+camerasList[lastSelectedCameraIndex]+" at index: "+ lastSelectedCameraIndex);
    try{audioSelect.selectedIndex = lastSelectedMicrophoneIndex; }catch(err) {"Not able to select microphone .. "+err}
    console.log("The last selected microphone is: "+audiosList[lastSelectedMicrophoneIndex]+" at index: "+ lastSelectedMicrophoneIndex);

  }   
  function firstStream() { 
    



/*

    navigator.getUserMedia(getLatestGUM(camerasList,audiosList), function (stream) {
    localVideoStream = stream;
    localVideo.srcObject = localVideoStream;
    }, function(error) { console.log(error);});
    */
  }
  function getStream() { 

    if (peerConn){peerConn.removeStream(localVideoStream);}
    if (localVideoStream) {
      localVideoStream.getTracks().forEach(function (track) { track.stop(); });
      localVideo.srcObject = null;
      localVideo.src = "";
    }


      var microphoneIndex = audioSelect.selectedIndex;
      console.log("Microphone # chosen: "+microphoneIndex);
      localStorage.setItem('localMicrophoneIndex', microphoneIndex);

      var cameraIndex = videoSelect.selectedIndex;
      console.log("Camera # chosen: "+cameraIndex);
      localStorage.setItem('localCameraIndex', cameraIndex);

      getLatestGUM(peerConn,false,camerasList,audiosList);

  }  
  function gotStream(stream) {	}
  function handleError(error) {  console.log('Error: ', error); }


  // Signaling is started... allow connection info
  wsc.onopen = function() {
    wsc.send(JSON.stringify({join:group})); // join the group 
      (function move() {
        wsc.send(JSON.stringify({room:group,"control": localControlNumber }));
        if (connected==false && localNotRemote!=null && localNotRemote == true){
            initiateCall(); console.log("Iniciating a new call...");
        }
      setTimeout(move, (Math.floor(Math.random() * 5) + 8) * 1000);
    })();
   }
};
/* End of page ready */


function prepareCall() {
  if (peerConn != null){peerConn.close(); peerConn = null;}

  peerConn = new RTCPeerConnection(peerConnCfg);
  // send any ice candidates to the other peer
  peerConn.onicecandidate = onIceCandidateHandler;
  // once remote stream arrives, show it in the remote video element
  peerConn.onaddstream = onAddStreamHandler;
  // state change
  peerConn.oniceconnectionstatechange = function() {
        if( peerConn != null && peerConn.iceConnectionState != null && peerConn.iceConnectionState == 'disconnected' ) {
            endCall();
            console.log("Connection disconnected and call ended / connected false...");  
        }
        if(peerConn != null && peerConn.iceConnectionState != null && peerConn.iceConnectionState == 'connected' ) {
          console.log('connected');
          connected = true; 
      }
    }
  

};

// run start(true) to initiate a call
function initiateCall() {
  prepareCall();
  // get the local stream, show it in the local video element and send it
    getLatestGUM(peerConn,false,camerasList,audiosList);

};

function answerCall() {
  prepareCall();
  // get the local stream, show it in the local video element and send it
  getLatestGUM(peerConn,true,camerasList,audiosList);

};

wsc.onmessage = function (evt) {

/* If the message contains control data... */
  var obj = JSON.parse(evt.data);
  if (obj.msg !== undefined){ 
      if (obj.msg == "**comment**"){callbackObj.showMessage("comment");}
      else if (obj.msg == "**screen**"){changeCamera();}
      else if (obj.msg == "**reboot**"){location.reload(); /* wsc.send("**message** Chbar Ampov app connection restarting");*/ }
      else if (obj.msg == "**renegociate**"){  endCall();  }
      else if (obj.msg.includes("**message**")){callbackObj.textMessage(obj.msg.substr(11)); }
  }
  if (obj.control!==undefined){
        //console.log(" obj.control: "+obj.control);
        /* If remote connection RENEWED ( browser error or connection error on remote side ) then RESET local connection for reconnection */
        if (remoteControlNumber>0 && remoteControlNumber!==obj.control){ 
            resetTimes++; console.log("Reset "+resetTimes+" times");
            endCall(); 
            console.log("Call ended / connected false / Reset "+resetTimes+" times");
        }
        /* save remote connection number */
        remoteControlNumber = obj.control;
        /* local connection older than remote connection -> allow iniciation on this side*/
        if( remoteControlNumber < localControlNumber ){ console.log("Location set to : remote"); localNotRemote = false; }
        /* Remote connection older than local connection -> disallow connection iniciation */
        else{ console.log("Location set to : local "); if (localNotRemote != null && localNotRemote == false){connected = false;} localNotRemote = true; }
  }

  var signal = null;
  if (!peerConn) answerCall();
  signal = JSON.parse(evt.data);
  if (signal.sdp) {
    console.log("Received SDP from remote peer.");
    peerConn.setRemoteDescription(new RTCSessionDescription(signal.sdp));
  }
  else if (signal.candidate) {
    console.log("Received ICECandidate from remote peer.");
    peerConn.addIceCandidate(new RTCIceCandidate(signal.candidate));
  } else if ( signal.closeConnection){
    console.log("Received 'close call' signal from remote peer.");
    endCall();
  }
};

function createAndSendOffer() {
    peerConn.createOffer(
      function (offer) {
        var off = new RTCSessionDescription(offer);
        peerConn.setLocalDescription(new RTCSessionDescription(off), 
          function() {
            wsc.send(JSON.stringify({room:group,"sdp": off }));
          }, 
          function(error) { console.log(error); }
        );
      }, 
      function (error) { console.log(error); }
    );
};

function createAndSendAnswer() {
    peerConn.createAnswer(
      function (answer) {
        var ans = new RTCSessionDescription(answer);
        peerConn.setLocalDescription(ans, function() {
            wsc.send(JSON.stringify({room:group,"sdp": ans }));
          }, 
          function (error) { console.log(error);}
        );
      },
      function (error) {console.log(error);}
    );
};

function onIceCandidateHandler(evt) {
    if (!evt || !evt.candidate) return;
    wsc.send(JSON.stringify({room:group,"candidate": evt.candidate  }));
};

function onAddStreamHandler(evt) {
    // set remote video stream as source for remote video HTML5 element
    remoteVideo.srcObject = evt.stream;
};

function endCall() {
    if (peerConn != null) {peerConn.close();}
     //peerConn.oniceconnectionstatechange = null;
    peerConn = null;
    /*
    if (localVideoStream){
      localVideoStream.getTracks().forEach(function (track) {
        track.stop();
      });
      localVideo.src = "";
    }
    */
    if (remoteVideo){ remoteVideo.src = "";}
    connected = false; localNotRemote = null;
};
//
//
/* App methods */
//
//
function sendMessageFromApp(t) { if (t=="muteAudio"){muteAudio();} wsc.send(JSON.stringify({room:group,"msg": t })); }

function changeCamera() 
{
    // stop all local streams
    if (peerConn){peerConn.removeStream(localVideoStream);}    
    if (localVideoStream) {
      localVideoStream.getTracks().forEach(function (track) { track.stop(); });
      localVideo.srcObject = null;
      localVideo.src = "";
    }
  // save screen setting
  if(getSavedPrefs("watchingScreen") == "false"){ localStorage.setItem('watchingScreen', "true");}
  else{localStorage.setItem('watchingScreen', "false");}
    console.log("Screen : "+getSavedPrefs('watchingScreen'));
      getLatestGUM(peerConn,false,camerasList,audiosList);
}

function getSavedPrefs(prefName){
  if(localStorage.getItem(prefName)!=null && localStorage.getItem(prefName)!=""){return localStorage.getItem(prefName);}
  else {return 0;}
}
function getLatestGUM(peerConn,answerNotOffer,camerasList,audiosList){
  var getUserMediaConstraints = {"audio": true, "video": true}
  if (getSavedPrefs('watchingScreen')== "true"){
    console.log("Screen true");
    getUserMediaConstraints.audio = false;
    getUserMediaConstraints.video = { mandatory: { 'chromeMediaSource': 'desktop','chromeMediaSourceId': 'screen:1:0' /*chromeMediaSource: 'screen'  maxWidth: 640, maxHeight: 480 */} } ;
      navigator.getUserMedia(getUserMediaConstraints, function (stream) {

        var singleConstraint = {"audio": true, "video": false}
        if(getSavedPrefs("localMicrophoneIndex") > 0){
          // we want to chck if the right ammount of devices are here...
          console.log("Saved prefs is > 0 " + getSavedPrefs("localMicrophoneIndex"));
          singleConstraint.audio = { deviceId: {exact: audiosList[getSavedPrefs("localMicrophoneIndex")]}}
        }
        console.log("Single constraint "+JSON.stringify(singleConstraint));
        navigator.getUserMedia(singleConstraint, function (audioStream) {
          audioPlusScreenStream = new MediaStream();
          audioPlusScreenStream.addTrack( stream.getVideoTracks()[0] );
          audioPlusScreenStream.addTrack( audioStream.getAudioTracks()[0] );
          localVideoStream = audioPlusScreenStream;
          localVideo.srcObject = localVideoStream;
          if (peerConn){
            peerConn.addStream(localVideoStream);
            if(answerNotOffer==true){createAndSendAnswer();}else{createAndSendOffer();}
          }
      }, function (error) { console.log(error);});
    },  function(error) { console.log(error);}); 
  }else{
    audioPlusScreenStream = null;
    if(getSavedPrefs("localMicrophoneIndex") > 0){
      // we want to chck if the right ammount of devices are here...
      console.log("Saved prefs is > 0 " + getSavedPrefs("localMicrophoneIndex"));
      getUserMediaConstraints.audio = { deviceId: {exact: audiosList[getSavedPrefs("localMicrophoneIndex")]}}
    }
    if(getSavedPrefs("localCameraIndex") > 0){
      console.log("Saved prefs is > 0 " + getSavedPrefs("localCameraIndex"));
      getUserMediaConstraints.video = { deviceId: {exact: camerasList[getSavedPrefs("localCameraIndex")]}}
    }
    navigator.getUserMedia(getUserMediaConstraints, function (stream) {
      localVideoStream = stream;
      localVideo.srcObject = localVideoStream;
      if (peerConn){
        peerConn.addStream(localVideoStream);
        if(answerNotOffer==true){createAndSendAnswer();}else{createAndSendOffer();}
      }
    },  function(error) { console.log(error);}); 

  }
  console.log(JSON.stringify(getUserMediaConstraints));
  //return getUserMediaConstraints;
}