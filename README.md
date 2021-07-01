# MQTT-PROXY

## Aim

This is a very simple local proxy, which takes details of an MQTT broker, and then forwards all messages recieved on the subscribed topic, to the same topic on a Secure Websocket local server.

It may need tweaking to work for your specific scenario, so forking is encourage, but it should provide a decent foundation.

Designed for use with my MQTT Topic Tree explorer because, well, why not right? 😉

## To use

1) Fork this repo
2) Clone it to your local machine
3) Modify the .env file (note: SERVER_* and CLIENT_* env vars are able to be the same if needed)
4) Run the broker with `node server.js`
5) After this, run the main app, which will forward all messages to the local WSS enabled broker
6) Explore this using https://tomdev10-mqtt-topic-tree.netlify.app/ 

Note: if the connection in browser fails to the local secure server, please use Chrome, and type in the URL bar: `chrome://flags/#allow-insecure-localhost`

This should then allow the connection 🎉