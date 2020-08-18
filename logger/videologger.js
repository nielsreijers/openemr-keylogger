let aa_startImmediately = true

let aa_bitsPerSecond = 800000;
let aa_timeSlice = 1000;
let aa_mimeType = 'video/webm';
let aa_type = 'video';
let aa_starttime = '';

var options = {
    type: aa_type,
    mimeType: aa_mimeType,
    disableLogs: false,
    getNativeBlob: false, // enable it for longer recordings
    // video: recordingPlayer
    ignoreMutedMedia: false,
    bitsPerSecond: aa_bitsPerSecond,
    timeSlice: aa_timeSlice,
}

var aa_state = {}

function aa_turnon() {
    console.log("aa_turnon() called.");

    aa_state = {}

    var commonConfig = {
        onMediaCaptured: function(stream) {
            console.log('onMediaCaptured() called.')
            aa_state.stream = stream;
            aa_startstop.disabled = false;
            if (aa_startImmediately) {
                aa_startstop.onclick();
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

    aa_captureAudioPlusVideo(commonConfig);
}

function aa_turnoff() {
    console.log("aa_turnoff() called.");

    aa_stopStream();

    aa_state = {};
}

function aa_blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};

function aa_startRecording() {
    console.log("aa_startRecording() called.");

    aa_state.blobs = [];
    options.ondataavailable = function(blob) {
        aa_state.blobs.push(blob);
        aa_blobToBase64(blob).then(base64encoded => {
            // base64encoded now looks with something like this:
            //    "data:video/x-matroska;codecs=avc1,opus;base64,Q7Z1…xMIqrZDmb7+gYAUyoqJ/euC8Zu5hEe6frr3xfDTLJSfLqPJQ="
            // We only want to send the base64 encoded data
            base64encoded = base64encoded.substr(base64encoded.indexOf('base64')+7)
 
            const formData = new FormData();
            formData.append('filename', `${username}-${aa_starttime}.webm`);
            formData.append('binarydata', base64encoded);

            let url = `${window.location.origin}/${web_root}/logger/videologger-srv.php`;
            fetch(url, { method: 'post', body: formData })
            .then(response => response.text())
            .then(data => {
                console.log('[videologger]:', data);
            })
            .catch((error) => {
                console.error('[videologger] Error:', error);
            });           
        });
    };

    aa_state.recordRTC = RecordRTC(aa_state.stream, options);
    aa_state.recordRTC.startRecording();
    aa_starttime = `${Date.now()}`;
    filenumber = 0;
}

function aa_stopStream() {
    console.log("aa_stopStream() called.");

    if(aa_state.stream && aa_state.stream.stop) {
        aa_state.stream.stop();
        aa_state.stream = null;
    }

    if(aa_state.stream instanceof Array) {
        aa_state.stream.forEach(function(stream) {
            stream.stop();
        });
        aa_state.stream = null;
    }

    console.log('Recording status: stopped');
    if (aa_state.recordRTC.getBlob()) {
        console.log('<br>Size: ' + bytesToSize(aa_state.recordRTC.getBlob().size));        
    }
}


function aa_stopRecording() {
    console.log("aa_stopRecording() called.");

    if(aa_state.recordRTC) {
        aa_state.recordRTC.stopRecording(function(url) {
            if(aa_state.blobs && aa_state.blobs.length) {
                var blob = new File(aa_state.blobs,'tmp.webm', {
                    type: aa_mimeType
                });
                
                aa_state.recordRTC.getBlob = function() {
                    return blob;
                };
            }
            aa_state.blobs = [];
        });
    }
}


//// copied from RecordRTC example
function aa_captureUserMedia(mediaConstraints, successCallback, errorCallback) {
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


function aa_captureAudioPlusVideo(config) {
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
    aa_captureUserMedia(constraints,
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

// Add button to start/stop recording
let aa_startstop = document.createElement('button');
aa_startstop.innerText = "start recording";
aa_startstop.disabled = true;
let aa_logo=document.getElementById('oemr_logo').parentElement;
aa_logo.parentElement.insertBefore(aa_startstop,aa_logo);

aa_startstop.onclick = () => {
    if (aa_startstop.textContent = aa_startstop.textContent == "start recording") {
        aa_startstop.textContent = "stop recording";
        aa_startRecording();
    } else {
        aa_startstop.textContent = "start recording";
        aa_stopRecording();
    }
}

if (aa_startImmediately) {
    aa_turnon();
}