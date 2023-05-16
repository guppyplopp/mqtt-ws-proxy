const http = require('http');
const mqtt = require('mqtt');
const { Server } = require('ws');
const config = require('./config.json');



// Read NMS Config file
let NMSConfig;
http.get("http://localhost/imagine/nms-config.js", (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    data = data.split('=')[1]; // get the json content. The original data starts with "var NMSConfig = {"
    let rowsWithComments = data.split('\n');
    let rows = [];
    rowsWithComments.forEach(row => {
      row = row.trim(); // remove spaces before //
      row = row.replace(';', ''); // remove semicolon command ends
      if (!row.startsWith('//')) {
        rows.push(row);
      }
    });
    NMSConfig = JSON.parse(rows.join('\n'));
    console.log('Reading data from NMSConfig file of Imagine server:', NMSConfig);
    init();
  });

}).on('error', (err) => {
  console.log('Error getting file:', err);
});





// WS
// Handling Websocket connection to the browser/GUI

const connections = new Set();
const messageQueue = [];


function init() {

  const ws = new Server({port: NMSConfig.mqttWebsocketProxyPort});
  console.log(' ');
  console.log(' ');
  console.log(' ');
  console.log(`Websocket server listening on port ws://localhost:${NMSConfig.mqttWebsocketProxyPort}`);

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
  


  // check the queue 
  setInterval(() => {
    if (connections.size > 0) {
      while (messageQueue.length > 0) {
        let data = messageQueue.pop();
        sendToWS(data);
      }
    }
  }, 1000);

}



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


// Called from inside Imagine
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
    // Send to WebSocket
    sendToWS({topic: topic, message: message.toString()});
  });
}


function subscribeToTopic(topic) {
  mqttClient.subscribe(topic);
  console.log('Subscribed to topic:', topic);
}





