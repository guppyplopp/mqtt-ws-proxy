if ("WebSocket" in window) {
    //            alert("WebSocket is supported by your Browser!");
    
    // Let us open a web socket
    let url = document.getElementById('url').value;
    console.log('Trying to connect to: ' + url);
    document.getElementById('answer').innerHTML = "";
    ws = new WebSocket(url);
    // ws = new XMLHttpRequest(url);

    ws.onopen = function() {

        // Web Socket is connected, send data using send()
        console.log("Connection open.");
        document.getElementById('answer').innerHTML += '\n' + "Connection open.";
        // ws.send("I am connected");
        // console.log("Message is sent...");
    };

    ws.onmessage = function (evt) { 
        let received_msg = evt.data;
        try {
        received_msg = JSON.parse(received_msg);
        received_msg.message = JSON.parse(received_msg.message);
        console.log('Object recieved: ', received_msg);
        received_msg = JSON.stringify(received_msg);
        } catch (error) {
        
        }
        // received_msg = JSON.parse(received_msg);
        received_msg.replace('\r', '');
        console.log("Message is received...", received_msg);
        document.getElementById('answer').innerHTML += '\n' + received_msg;
    };

    ws.onclose = function() { 

        // websocket is closed.
        document.getElementById('answer').innerHTML = "Connection is closed..."; 
    };
    
} else {

    // The browser doesn't support WebSocket
    document.getElementById('answer').innerHTML = "WebSocket NOT supported by your Browser!";
}


function WebSocketSend() {
    let msg = document.getElementById('command').value;
    ws.send(msg);
    console.log(msg + ':sent');
}

function WebSocketSendJSON() {
    let msg = document.getElementById('jsoncommand').value;
    msg = JSON.stringify(msg);
    ws.send(msg);
    console.log(msg + ':sent');
}

function WebSocketSendButtonPressed() {
    let primeData = {
    "@type":"event/io/button/pressed",
    // "@id":"c967561d-eb90-4dc3-a0d8-583ce5488960",
    "@id":"c967561d-eb90-4dc3-a0d8-583ce0000000",
    "buttonId":"12",
    "creationDateTime":"2017-06-11T06:35:14.901+02:00",
    "processId":"Imagine",
    "systemId":"raspberrypi"
    };
    
    let msg = {};
    msg.topic = 'raspberrypi/event/io/button';
    msg.message = primeData;
    msg = JSON.stringify(msg);
    ws.send(msg);
    console.log(msg + ':sent');
}