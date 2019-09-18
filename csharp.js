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
////////////////////////////
//                        //
/*    C# APP METHODS */   //  1 renegociate , 2 sendMessageFromApp , 3 toggleCameraScreen , 4 getSavedPrfs , 5 muteAudio
//                        //
////////////////////////////
function renegociate()
{
  clearStreams();
  getLatestGUM(peerConn,false,camerasList,audiosList);
}

function sendMessageFromApp(t) { if (t=="muteAudio"){muteAudio();} wsc.send(JSON.stringify({room:group,"msg": t })); }

function toggleCameraScreen(numberOfScreens) 
{
  console.log("Number of screens: "+numberOfScreens);
  ammountOfScreens = numberOfScreens;
    // stop all local streams
    clearStreams();
    
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