
const mqtt = require('mqtt');
const { Server } = require('ws');
const config = require('./config.json');

const mqttBroker = 'mqtt://' + config.mqttIP + ':' + config.mqttPort;


function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

// WS
// Handling Websocket connection to the browser/GUI
const ws = new Server({port: config.myWebsocketPort});
console.log(' ');
console.log(' ');
console.log(' ');
console.log(`Websocket server listening on port ws://localhost:${config.myWebsocketPort}`);
const connections = new Set();

ws.on('connection', (connectingWS) => {
  console.log('New client connected to Websocket');
  connections.add(connectingWS);
  
  connectingWS.on('message', (data) => {
    try {
      data = JSON.parse(data);
      console.log('[LOG]=== Websocket incoming total data:', data);
      console.log('[LOG]=== Websocket incoming topic:', data.topic);
      console.log('[LOG]=== Websocket incoming message data:', data.message);
      if (data.topic === 'subscribe') {
        subscribeToTopic(data.message);
      } else {
        // Send to MQTT
        const msg = JSON.stringify(data.message);
        console.log('[LOG]=== Proxy forwards to MQTT: ');
        console.log('[LOG]=== Topic: ', data.topic);
        console.log('[LOG]=== Message: ', msg);
        mqttClient.publish(data.topic, msg, (error) => {
          if (error) console.error(error);
        });
      }
      
    } catch (error) {
      console.log(error, 'Message recieved:', data.toString());
    }
  });

  connectingWS.on('close', () => {
    connections.delete(connectingWS);
    console.log('Client has disconnected');
  });
});

function sendToWS(data) {
  connections.forEach((connectingWS) => {
    connectingWS.send(JSON.stringify(data));
    console.log('Sent to WS ===== ', data);
  });
}







// MQTT
// Handling MQTT connection to the broker
const mqttClient = mqtt.connect(mqttBroker, {clientID: 'Imagine'});

function subscribeToTopic(topic) {
  mqttClient.subscribe(topic);
  console.log('Subscribed to topic:', topic);
}



mqttClient.on('connect', function () {
  console.log('[LOG]================= connected to remote mqtt =================');
  console.log('mqttBroker:', mqttBroker);
  subscribeToTopic('+/event/#');
});

mqttClient.on('error', function (error) {console.log('[LOG]================= error from remote mqtt =================: ', error);});


mqttClient.on('message', function(topic, message) {
    console.log(`[LOG]================= message received from MQTT =============: ${topic.toString()} : ${message.toString()}`);
    // console.log("[LOG]================= mqttMessageDispatch to WS ====:", topic ,' with: ',  message);
    // Send to WS
    sendToWS({topic: topic, message: message.toString()});

    // Debug
    // debugBounceMessage({topic: topic, message: message});
    // debugSendMessage();
});



function debugSendMessage() {
  let mess = {
    "@type":"event/io/button/pressed",
    // "@id":"c967561d-eb90-4dc3-a0d8-583ce5488960",
    "@id":"c967561d-eb90-4dc3-a0d8-583ce0000000",
    "buttonId":"12",
    "creationDateTime":"2017-06-11T06:35:14.901+02:00",
    "processId":"Imagine",
    "systemId":"raspberrypi"
  };
  setTimeout(() => {
    console.log('Auto send message: ', mess);
    mess = JSON.stringify(mess);
    mqttClient.publish('raspberrypi/event/io/button', mess);
  }, 10000);
}

// debugSendMessage();




function debugBounceMessage(data) {
  setTimeout(() => {
    // Alt 2
    let mess = data.message.toString();
    mess = JSON.parse(mess);
    mess = JSON.stringify(mess);
    console.log('After json stringify. ', mess);
    data.message = mess; 

    console.log('Bouncing back ========================');
    console.log('Bouncing back topic: ', data.topic);
    console.log('Bouncing back message: ', data.message);
    mqttClient.publish(data.topic, data.message);
    

  }, 10000);
}