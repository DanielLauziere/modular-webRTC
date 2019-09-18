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
function signaling(websockethost,group){
    var wsc = new WebSocket(websockethost.wssHost);    
    wsc.onopen = function() { wsc.send(JSON.stringify({join:group}));/* Join a room using a unique name */ wsc.send(JSON.stringify({room:group,"connectedSignal": "connectedSignal" })); }
    wsc.onmessage = function (evt) {var signal = JSON.parse(evt.data); if(signal.connectedSignal){rtc.Call(true);}else{ rtc.Call(false);  if (signal.sdp) { rtc.sdp(signal);} else if (signal.candidate) { rtc.candidate(signal);}}};
    this.offerAnswer = function(offerAnswer){wsc.send(JSON.stringify({room:group,"sdp": offerAnswer }));}
    this.onIceCandidate = function(evt){ wsc.send(JSON.stringify({room:group,"candidate": evt.candidate }));}
}