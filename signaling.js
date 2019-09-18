function signaling(websockethost,group){
    var wsc = new WebSocket(websockethost.wssHost);    
    wsc.onopen = function() { wsc.send(JSON.stringify({join:group}));/* Join a room using a unique name */ }
    wsc.onmessage = function (evt) { rtc.Call(false); var signal = JSON.parse(evt.data); if (signal.sdp) { rtc.sdp(signal);} else if (signal.candidate) { rtc.candidate(signal);} };
    this.offerAnswer = function(offerAnswer){wsc.send(JSON.stringify({room:group,"sdp": offerAnswer }));}
    this.onIceCandidate = function(evt){ wsc.send(JSON.stringify({room:group,"candidate": evt.candidate }));}
}