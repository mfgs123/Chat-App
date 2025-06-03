//defining ws (websockets)
//websocket is a communication protocol that allows simulatenous  
//two way communication over single TCP connection
const ws = require('ws')

//defining server and opening server on port 3000
const server = new ws.Server({ port: '3001'})

//using server, when theres a connection established with websockets
server.on('connection', socket => {
    socket.on('message', message => { //we are then listening for a messag, we take that message with a fucntion once againe
        //when sending a message in app, we get a buffer message so in terminal <buffer10/34>
        //to also display the message on console log , do the following, it will then show "hey"
        const b = Buffer.from(message)
        console.log(b.toString())
        //console.log(message)
        socket.send(`${message}`) //whatever server receives, server is going to echo message and send it back to whoever sent it

    })
})