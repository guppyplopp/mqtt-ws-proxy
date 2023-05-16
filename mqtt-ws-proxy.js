
const mqtt = require('mqtt');
const { Server } = require('ws');
const config = require('./config.json');
// const config = {
//   "mqttIP": "192.168.1.25", 
//   "mqttPort": "1883", 
//   "myWebsocketPort": "8086"
// };



function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

// let test = require('../imagine/imagine_gui/app/uiStrings_en.json');
// let test = require('C:/inetpub/wwwroot/imagine/uiStrings_en.json');
// console.log(test);

// fetch('http://192.168.3.2/imagine/nms-config.js', {method: 'GET'})
// .then(respone => respone.text())
// .then(text => console.log(text));

// WS
// Handling Websocket connection to the browser/GUI
const ws = new Server({port: config.myWebsocketPort});
console.log(' ');
console.log(' ');
console.log(' ');
console.log(`Websocket server listening on port ws://localhost:${config.myWebsocketPort}`);
const connections = new Set();
const messageQueue = [];


// check the queue 
setInterval(() => {
  if (connections.size > 0) {
    while (messageQueue.length > 0) {
      let data = messageQueue.pop();
      sendToWS(data);
    }
  }
}, 1000);



ws.on('connection', (connectingWS) => {
  console.log('New client connected to Websocket');
  connections.add(connectingWS);
  
  connectingWS.on('message', (data) => {
    try {
      data = JSON.parse(data);
      // console.log('[LOG]=== Websocket incoming topic:', data.topic);
      console.log('[LOG]=== Websocket incoming total data:', data);
      // console.log('[LOG]=== Websocket incoming message data:', data.message);
      if (data.topic === 'connectToMQTT') {
        let ip = data.message;
        connectToMQTT(ip);
      } else if (data.topic === 'subscribe') {
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
  if (connections.size > 0) {
    connections.forEach((connectingWS) => {
      connectingWS.send(JSON.stringify(data));
      console.log('Sent to WS ===== ', data);
    });
  } else {
    messageQueue.push(data);
  }
}







// MQTT
// Handling MQTT connection to the broker

let mqttClient; 


function connectToMQTT(ip) {

  if (mqttClient) {
    mqttClient.end();
  }

  const mqttAddress = 'mqtt://' + ip + ':' + config.mqttPort;
  mqttClient = mqtt.connect(mqttAddress, {
    clientID: 'Imagine', 
    connectTimeout: 3000, 
    reconnectPeriod: 10000, 
  });

  mqttClient.on('connect', function () {
    console.log('[LOG]================= connected to remote mqtt =================');
    console.log('mqttAddress:', mqttAddress);
    sendToWS({topic: 'log', message: JSON.stringify('Connected to mqtt (Prime pedal): ' + mqttAddress) });
    subscribeToTopic('+/event/#');
  });
  
  mqttClient.on('error', function (error) {
    console.log('[LOG]================= error from remote mqtt =================: ', error);
    sendToWS({topic: 'error', message: JSON.stringify('Error from remote mqtt: ' + error.toString()) });
  });

  
  
  mqttClient.on('close', function () {
    console.log('[LOG]================= Closed connection to remote mqtt =================: ');
    sendToWS({topic: 'log', message: JSON.stringify('Closed connection to remote mqtt: ' + mqttAddress) });
  });
  
  
  mqttClient.on('message', function(topic, message) {
    console.log(`[LOG]================= message received from MQTT =============: ${topic.toString()} : ${message.toString()}`);
    // console.log("[LOG]================= mqttMessageDispatch to WS ====:", topic ,' with: ',  message);
    // Send to WS
    sendToWS({topic: topic, message: message.toString()});

    // Debug
    // debugBounceMessage({topic: topic, message: message});
    // debugSendMessage();
  });
}


function subscribeToTopic(topic) {
  mqttClient.subscribe(topic);
  console.log('Subscribed to topic:', topic);
}





