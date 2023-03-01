
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
      const message = JSON.parse(data.toString());
      console.log('[LOG]=== Websocket incoming message:', message);
      if (data.topic === 'subscribe') {
        subscribeToTopic(data.topic);
      } else {
        // Send to MQTT
        mqttClient.publish(data.topic, data.message, (error) => {
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
});