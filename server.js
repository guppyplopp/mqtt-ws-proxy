const aedes = require('aedes')()
const https = require('https')
const ws = require('websocket-stream')
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();



const port = 8888

const keyfile = process.env.SERVER_KEYFILE
const certfile = process.env.SERVER_CERTFILE
let cert; 
let key;

try {
  key = fs.readFileSync(keyfile);
  } 
  catch (error) {
  if (error.code ==='ENOENT') {
      console.log("SERVER KEY File not Found !")
      key = null;
  }
  else{
    key = null;
  }
}

try {
  cert = fs.readFileSync(certfile);
  } 
  catch (error) {
     if (error.code==='ENOENT') {
         console.log("SERVER CERT File not Found !")
         cert = null;
     } else {
        cert = null;
     }
}

const options = {
  key,
  cert
};

const httpsServer = https.createServer(options);


ws.createServer({ server: httpsServer }, aedes.handle)

httpsServer.listen(port, function () {
  console.log(`secure websocket server listening on port wss://localhost:${port}`)
})