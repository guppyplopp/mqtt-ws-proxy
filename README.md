# MQTT-PROXY

## Aim

This is a very simple local proxy, which takes details of an MQTT broker, and then forwards all messages recieved on the subscribed topic, to the same topic on a Secure Websocket local server.

It may need tweaking to work for your specific scenario, so forking is encourage, but it should provide a decent foundation.

Designed for use with my MQTT Topic Tree explorer because, well, why not right? 😉

## To use

1) Clone this repo, or fork if you need to make changes to the behaviour to set it up for your broker.
2) Modify the .env file (note: SERVER_* and CLIENT_* env vars are able to be the same if needed) based on .env.example. *Note: if you need a certificate, the recommendation solution is to use [Let's Encrypt](https://letsencrypt.org/)*
3) Install the dependancies using `npm i`.
4) Run the broker with `node server.js`.
5) After this, run the main app in a different terminal `node index.js`, which will forward all messages to the local WSS enabled broker.
6) Explore this using https://tomdev10-mqtt-topic-tree.netlify.app/, which should open and connect automatically.


## Troubleshooting

Note: if the connection in browser fails to the local secure server, you may need to alter your browser configuration as below:

### Chrome

Visit the URL to allow the connection `chrome://flags/#allow-insecure-localhost`

### Firefox

Navigate to `about:config` and look at `network.websocket.allowInsecureFromHTTPS` and allow insecure.
You may also need to visit `https://localhost:8888` and/or `https://127.0.0.1:8888` and accept the insecure certificate.

### Safari

Visit `wss://localhost:8888` and accept the certificate, and navigate to the page. It will get stuck loading, but should then allow you to use the explorer.

![Homer getting angry at web browsers](https://media.giphy.com/media/CJxXHfRAYvtqU/source.gif)