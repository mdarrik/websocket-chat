const beeline = require("honeycomb-beeline")({
  writeKey: process.env.HONEYCOMB_API_KEY,
  dataset: "websocket-chat",
  serviceName: "server"
});

const server = require('http').createServer()
const io = require('socket.io')(server)

const ClientManager = require('./ClientManager')
const ChatroomManager = require('./ChatroomManager')
const makeHandlers = require('./handlers')

const clientManager = ClientManager()
const chatroomManager = ChatroomManager()
// Event: Connection Created, this is a long-running event that lives until the user disconnects. 
//So might want multiple traces? One for this over-arching connection and some for each "event".  
io.on('connection', function (client) {
  const {
    handleRegister,
    handleJoin,
    handleLeave,
    handleMessage,
    handleGetChatrooms,
    handleGetAvailableUsers,
    handleDisconnect
  } = makeHandlers(client, clientManager, chatroomManager) //make handlers gets called here

  console.log('client connected...', client.id)
  clientManager.addClient(client)
  // register event fired - new trace/event here? 
  client.on('register', handleRegister)
  // user joins channel - new trace/event here? 
  client.on('join', handleJoin)
  // user leaves channel - new trace/event here?
  client.on('leave', handleLeave)
  // user sends a message - new trace/event here? 
  client.on('message', handleMessage)
  // user requests chatrooms - new trace/event here? 
  client.on('chatrooms', handleGetChatrooms)
  // user requests users - new trace/event here? 
  client.on('availableUsers', handleGetAvailableUsers)
  // user disconnects. End the io.onConnection trace at the end of this event? 
  client.on('disconnect', function () {
    console.log('client disconnect...', client.id)
    handleDisconnect()
  })
   // error happens for the user, _should_ be attached to one of the other traces, but 
  client.on('error', function (err) {
    console.log('received error from client:', client.id)
    console.log(err)
  })
})

server.listen(3000, function (err) {
  if (err) throw err
  console.log('listening on port 3000')
})
