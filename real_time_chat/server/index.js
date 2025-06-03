//no longer using websockets, using socket.io instead
//socket.io provides built in feutres like automatic reconnection, fallback to HTTP, long-polling and multiplexing
//websocket requires more complex server and client architecture
import { createServer } from "http"
import { Server } from "socket.io"

//creating http server
const httpServer = createServer()

//using created server
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500"]
    }
})


//socket.io has a connection that emits every message to everyone connected
io.on('connection', socket => {
    console.log(`User ${socket.id} connected`) //displaying message of which specific user connected - each user gets unique id

    socket.on('message', data => { 
        console.log(data) //displaying data
        io.emit('message', `${socket.id.substring(0,5)}: ${data}`) //io.emit will emit this message to everyone that is currently connected
                                                                    //${socket.id.substring(0,5)} will display who sent the message using the unique user if but only displaying first 5 characters

    })
})

//httpServer.listen() is an interface that is used to start server by accepting new connections - making sure server is listening
//1st argument - port number
//2nd parameter - optional callback function

//listening on port 3500 and displaying appropiate message using anonymous funnction
httpServer.listen(3500, () => console.log('listening on port 3500') )

