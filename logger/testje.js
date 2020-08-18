let startImmediately = false

let onoff = document.getElementById("knopje_onoff");
let startstop = document.getElementById("knopje_startstop");

onoff.onclick = () => {
    if (onoff.textContent = onoff.textContent == "turn on") {
        onoff.textContent = "turn off";
        turnon();
    } else {
        onoff.textContent = "turn on";
        turnoff();
    }    
}

startstop.onclick = () => {
    if (startstop.textContent = startstop.textContent == "start recording") {
        startstop.textContent = "stop recording";
        startRecording();
    } else {
        startstop.textContent = "start recording";
        stopRecording();
    }
}

let bitsPerSecond = 800000;
let timeSlice = 1000;
let mimeType = 'video/webm';
let type = 'video';
let params = {};
let starttime = '';

var options = {
    type: type,
    mimeType: mimeType,
    disableLogs: params.disableLogs || false,
    getNativeBlob: false, // enable it for longer recordings
    // video: recordingPlayer
    ignoreMutedMedia: false,
    bitsPerSecond: bitsPerSecond,
    timeSlice: timeSlice,
}

var state = {}

function turnon() {
    console.log("turnon() called.");

    state = {}

    var commonConfig = {
        onMediaCaptured: function(stream) {
            console.log('onMediaCaptured() called.')
            state.stream = stream;
            startstop.disabled = false;
            if (startImmediately) {
                startstop.onclick();
            }
        },
        onMediaStopped: function() {
            console.log("onMediaStopped() called.");
        },
        onMediaCapturingFailed: function(error) {
            console.error('onMediaCapturingFailed(error) called: ', error);

            if(error.toString().indexOf('no audio or video tracks available') !== -1) {
                alert('RecordRTC failed to start because there are no audio or video tracks available.');
            }
            
            if(error.name === 'PermissionDeniedError' && DetectRTC.browser.name === 'Firefox') {
                alert('Firefox requires version >= 52. Firefox also requires HTTPs.');
            }

            commonConfig.onMediaStopped();
        }
    };

    captureAudioPlusVideo(commonConfig);
}

function turnoff() {
    console.log("turn off() called.");

    stopStream();

    state = {};

    startstop.disabled = true;
}

const blobToBase64 = blob => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};

function startRecording() {
    console.log("start recording() called.");


    state.blobs = [];
    options.ondataavailable = function(blob) {
        state.blobs.push(blob);
        blobToBase64(blob).then(base64encoded => {
            let url = `http://localhost/openemr/logger/testje.php`;
            // base64encoded now looks with something like this:
            //    "data:video/x-matroska;codecs=avc1,opus;base64,Q7Z1…xMIqrZDmb7+gYAUyoqJ/euC8Zu5hEe6frr3xfDTLJSfLqPJQ="
            // We only want to send the base64 encoded data
            base64encoded = base64encoded.substr(base64encoded.indexOf('base64')+7)
            const formData = new FormData();
            formData.append('filename', `${starttime}.webm`);
            formData.append('binarydata', base64encoded);
            fetch(url, { method: 'post', body: formData })
            .then(response => response.text())
            .then(data => {
                console.log('[testje]:', data);
            })
            .catch((error) => {
                console.error('[testje] Error:', error);
            });           
        });
    };

    state.recordRTC = RecordRTC(state.stream, options);
    state.recordRTC.startRecording();
    starttime = `${Date.now()}`;
    filenumber = 0;
}

function stopStream() {
    console.log("stopStream() called.");

    if(state.stream && state.stream.stop) {
        state.stream.stop();
        state.stream = null;
    }

    if(state.stream instanceof Array) {
        state.stream.forEach(function(stream) {
            stream.stop();
        });
        state.stream = null;
    }

    console.log('Recording status: stopped');
    if (state.recordRTC.getBlob()) {
        console.log('<br>Size: ' + bytesToSize(state.recordRTC.getBlob().size));        
    }
}


function stopRecording() {
    console.log("stopRecording() called.");

    if(state.recordRTC) {
        state.recordRTC.stopRecording(function(url) {
            if(state.blobs && state.blobs.length) {
                var blob = new File(state.blobs,'tmp.webm', {
                    type: mimeType
                });
                
                state.recordRTC.getBlob = function() {
                    return blob;
                };
            }
            savetodisk(state.recordRTC.getBlob());
            state.blobs = [];
        });
    }
}



//// copied from RecordRTC example
function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(stream) {
        successCallback(stream);
    }).catch(function(error) {
        if(error && (error.name === 'ConstraintNotSatisfiedError' || error.name === 'OverconstrainedError')) {
            alert('Your camera or browser does NOT supports selected resolutions or frame-rates. \n\nPlease select "default" resolutions.');
        }
        else if(error && error.message) {
            alert(error.message);
        }
        else {
            alert('Unable to make getUserMedia request. Please check browser console logs.');
        }

        errorCallback(error);
    });
}

function captureAudioPlusVideo(config) {
    constraints = {
        "video": {
            "width": {
                "exact": 640
            },
            "height": {
                "exact": 480
            }
        },
        "audio": true
    }
    captureUserMedia(constraints,
        function(audioVideoStream) {
            config.onMediaCaptured(audioVideoStream);

            if(audioVideoStream instanceof Array) {
                audioVideoStream.forEach(function(stream) {
                    // addStreamStopListener(stream, function() {
                    //     config.onMediaStopped();
                    // });
                });
                return;
            }

            // addStreamStopListener(audioVideoStream, function() {
            //     config.onMediaStopped();
            // });
        }, function(error) {
            config.onMediaCapturingFailed(error);
        });
}


function savetodisk(blob) {
    filenumber += 1;
    let filename = `${starttime}.webm`;
    if(!blob) return alert('No recording found.');

    var file = new File([blob], filename, { type: mimeType });

    invokeSaveAsDialog(file, file.name);
};

if (startImmediately) {
    onoff.onclick();
}
