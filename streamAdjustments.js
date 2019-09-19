this.getInputDevices = function(type){
//
/* Enumerate camera / microphone choices ... add to select ...  */
// 
    var camerasList = []; audiosList = [];
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    function gotDevices(deviceInfos) {
        if(type=="Cameras"){
            var videoSelect = document.createElement("SELECT");
            document.getElementById("controls").appendChild(videoSelect);
            var option1 = document.createElement('option');
            option1.value = "";
            option1.text = "Choose a camera";
            videoSelect.appendChild(option1);
            camerasList.push("");
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
            }
        }
        if(type=="Microphones"){
            var audioSelect = document.createElement("SELECT");
            document.getElementById("controls").appendChild(audioSelect);
            var option = document.createElement('option');
            option.value = "";
            option.text = "Choose a microphone";
            audioSelect.appendChild(option);
            audiosList.push("");
            for (var i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i];
                var option = document.createElement('option');
                option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
                audioSelect.appendChild(option);
                audiosList.push(deviceInfo.deviceId);
                //console.log((audiosList.length + 1) + " audio device is : "+deviceInfo.deviceId );
                }
            }
        }
    }   
function handleError(error) {  console.log('Error: ', error); }
};