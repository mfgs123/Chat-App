//no longer using websockets, using socket.io instead
//socket.io provides built in feutres like automatic reconnection, fallback to HTTP, long-polling and multiplexing
//websocket requires more complex server and client architecture
import express from "express" //using express
import { Server } from "socket.io"
import path from "path" //node js module for path - used to set up static folder 
import { fileURLToPath } from "url"


const __filename = fileURLToPath(import.meta.url) //import.meta.url returns the current file youre working on - __filename is pointing at that
const __dirname = path.dirname(__filename) //__dirname gives you the parent folder of current file
//you dont have to create this if youre using commonJS modules - you can istead use either __dirname or __filename
//since we have "type" : "module" in package.json we have to do this

//defining a constant for the port being used for application
//this is used when getting our server to listen to requests - PORT is an argument
const PORT = process.env.PORT || 3500

//refering to our express server as app
const app = express()

//when the app gets a request, it will send everything to the public directory - it will contain static assets
//path.join() constructs a path using arguments passed by concatenating them
//e.g. path.join(__dirname, "public") = /path_to_dir/public
//__dirname doesnt work with type modules ->
app.use(express.static(path.join(__dirname, "public")))

//using .listen() that makes our express server (app) listen for incoming requests on specified port (3500 as defined above)
const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

//creating express server (instead of http server this time) and returning it to io variable
const io = new Server(expressServer, {
    //cors (Cross-Origin Resource sharing) is a system
    //it controls how resources hosted in one domain can be accessed by web page from another domain
    //e.g. this chat app can be accessed by both domains "http://localhost:5500" and "http://127.0.0.1:5500"
    //it ensures security, usability and performance
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : 
         ["http://localhost:5500", "http://127.0.0.1:5500", "http://127.0.0.1:3500"]
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




