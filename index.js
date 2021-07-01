
const dotenv = require('dotenv');
const mqtt = require('mqtt');
const fs = require('fs');
var open = require('open');

dotenv.config();

const mqttUser = process.env.MQTT_USER 
const mqttPass = process.env.MQTT_PASS 
const clientKeyfile = process.env.MQTT_KEYFILE
const clientCertfile = process.env.MQTT_CERTFILE
const clientCACertfile = process.env.MQTT_CA_CERTS
const mqttTopic = process.env.MQTT_TOPIC
const mqttBroker = process.env.MQTT_BROKER
let mqttCaCerts 
let mqttCertfile
let mqttKeyfile

try {
    mqttKeyfile = fs.readFileSync(clientKeyfile);
    } 
    catch (error) {
    if (error.code ==='ENOENT') {
        console.log("Client KEY File not Found !")
        mqttKeyfile = null;
    }
    else{
        mqttKeyfile = null;
    }
}

try {
    mqttCertfile = fs.readFileSync(clientCertfile);
    } 
    catch (error) {
       if (error.code==='ENOENT') {
           console.log("Client CERT File not Found !")
           mqttCertfile = null;
       } else {
            mqttCertfile = null;
       }
}

try {
    mqttCaCerts = [fs.readFileSync(clientCACertfile )];
    } 
    catch (error) {
    if (error.code ==='ENOENT') {
        console.log("Client CA File not Found !")
        mqttCaCerts = null;
    } else {
        mqttCaCerts = null;
    }
}

const auth = mqttUser &&  mqttPass ? {
    username: mqttUser,
    password: mqttPass
} : {};

const tls = mqttCaCerts &&  mqttCertfile && mqttKeyfile ?  {
    ca: mqttCaCerts,
    cert: mqttCertfile,
    key: mqttKeyfile,
} : {};

if (!mqttTopic)  {
    console.error('You must explicitly specify a topic in the env file, even if you want wildcard')
    process.exit(1);
}

const localClient = mqtt.connect('wss://localhost:8888', {tls: {...tls}, rejectUnauthorized: false});

const mqttClient = mqtt.connect(mqttBroker, {...auth, ...tls});



mqttClient.on('connect', function () {console.log('[LOG]================= connected to remote mqtt =================');});
localClient.on('connect', function () {console.log('[LOG]================= connected to local mqtt =================');});

mqttClient.on('error', function (error) {console.log('[LOG]================= error from remote mqtt =================: ', error);});
localClient.on('error', function (error) {console.log('[LOG]================= error from local mqtt =================: ', error);});

mqttClient.subscribe(mqttTopic);

mqttClient.on('message', function(topic, message) {
    console.log(`[LOG]================= message received =================: ${topic.toString()} : ${message.toString()}`);
    console.log("[LOG]================= mqttMessageDispatch to =================:", topic ,' with: ',  message);
    localClient.publish(topic, message, {retain: true})
});

open('https://tomdev10-mqtt-topic-tree.netlify.app?usingProxy=true');