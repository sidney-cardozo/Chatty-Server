

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid')



// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    console.log("broadcasting data")
    client.send(JSON.stringify(data));
  });
};

wss.sendUserCount = function sendUserCount(number){
  let msg = { type: "userCountUpdate",
               numberOfUsers: number}
   wss.broadcast(msg)
}



wss.on('connection', (ws) => {
  console.log('Client connected', wss.clients);
  wss.sendUserCount(wss.clients.size)

  ws.onmessage = function(event) {
    console.log(event);
    let msg = JSON.parse(event.data);
    console.log("msg type" +msg.type)
    // Using switches to swiff through incoming client requests
    switch(msg.type){
      case "postMessage":
        msg['id'] = uuid.v4();
        msg['type'] = "incomingMessage"
        wss.broadcast(msg);
        break;
      case "postNotification":
        msg['id'] = uuid.v4();
        msg['type'] = "incomingNotification"
        wss.broadcast(msg)
        break;
      default:
        throw new Error("Unknown event type ");
    }
  }

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    wss.sendUserCount(wss.clients.size)});

});