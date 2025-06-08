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

//creating constant for admin users
const ADMIN = "Admin"

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

//setting up state for users  - creating a constant that contains 2 objects - array and function
const UsersState = {
    "users": [],
    //users array initially empty and initialised by setUsers function
    "setUsers": function(newUsersArray) {
        this.users = newUsersArray
    }
}
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


//establishing connection and interface that user sees
io.on('connection', socket => {
    console.log(`User ${socket.id} connected`) //displaying message of which specific user connected - each user gets unique id

    //upon connection - message only to user that just connected - using buildMsg() function
    //where ADMIN user is sending the appropiate message
    socket.emit('message', buildMsg(ADMIN,"Welcome to Chat App! :) ")) //socket.emit goes directly to user

    //listener as  user enters the rrom
    socket.on('enterRoom', ({name, room}) => {

        //making user leave previous room before entering new room
        //using getUser and socket.id (socket id is the id of the current user)
        //getUser() returns user object that matches that id (contain id,room,name)
        const prevRoom = getUser(socket.id)?.room //using optional chaining that gets room property of that object withoutworrying aboyt TypeError

        //if previous room found
        if(prevRoom){
            socket.leave(prevRoom) //user leaves previous room
            //emitting a message ONLY to that previous room
            io.to(prevRoom).emit('message', buildMsg(ADMIN,`${name} has left the room`))
        }

        //activating user
        const user = activateUser(socket.id, name, room)

        //cannot update previous room users list until after state update in activate user
        if(prevRoom) {
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom) //updating prev room users list so that it doesnt contain current user
            })
        }

        //adding user to room
        socket.join(user.room)

        //sending a message to ONLY user that joined the room
        socket.emit('message', buildMsg(ADMIN, `You have joined ${user.room} chat room`))

        //also sending message to everyone else
        socket.broadcast.to(user.toom).emit('message', buildMsg(ADMIN,`${user.name} has joined the room`))

        //update user list for the room that user justn joined
        io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
        })

        //updatinf user list for everyone / all other rooms
        io.emit('roomList', {
            rooms: getAllActiveRooms()
        })

    })


    //When user disconnects, this will be sent to all tohers
    socket.on('disconnect', () => {
        //getting a user anjd calling appropiate function
        const user = getUser(socket.id)
        userLeavesApp(socket.id) //filters out user from state

        if(user) {

            //emitting appropiate message to users in that chatroom that user left
            io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`))

            //updating list of active users after user leaves room
            io.to(user.room).emit('userList',{
                users: getUsersInRoom(user.room)
            })

            io.emit('roomList', {
                rooms:getAllActiveRooms()
            })
        }

        //to keep it consistent - displaying message on console
        console.log(`User ${socket.id} disconnected`)
        
    })

    //Listening for message event, users receive messages that other users sent
    socket.on('message', ({name, text}) => { 
        const room = getUser(socket.id)?.room //like before, only getting room
        
        //when room found, we are emitting message and user that sent message to that room
        if(room){
            io.to(room).emit('message', buildMsg(name,text))
        }
    })

    //Listen for activity - displaying message when a user is currently typing
    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room

        //broadcast sends who is typing message to ebveryone else, not to the person actually typing
        if(room) {
            socket.broadcast.to(room).emit('activity', name)
        }
        
    })
})

//function that builds message that the server sends out - also includes time message was sent
function buildMsg(name, text) {
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', { //time funcion built into javasciprt - no library needed
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric'
        }).format(new Date()) //format gives you 1:05:31pm kind of format
    }  
}

//user functions - not necessarily when user enters room - when it gets activated
function activateUser(id, name, room) {
    const user = { id, name, room } //const that contain objects with relevant info
    //calling the setUsers function from userState that creates arrays of users using element passed in
    UsersState.setUsers ([
        //we use the exisitng users array, we are filtering, returns an array of all users that dont match the user id passed in
        ...UsersState.users.filter(user => user.id !== id),
        user //passing in user to array, doing this way  ensures that there in only one unique instance of that id
    ])
    return user
}

//function for when user leaves the chap app
function userLeavesApp(id) {
    UsersState.setUsers (
      UsersState.users.filter(user => user.id !== id) //returns an array containing all users whose if doesnt match id passed in
      //unlike activateUser(), were not adding the user to the list ath the ebnd
    )
} 

//function that returns user object (contains id, room and name) for that specific id
function getUser(id) {
    return UsersState.users.find(user => user.id === id)
}

//function that gets users inside the room specified (passed as argument) 
//it looks through the array users and filters it to return an array that meets consitions - that user's room matches the room passed as argument
function getUsersInRoom(room) {
    UsersState.users.filter(user => user.room === room)
}

//function that returns an array of all active rooms with NO duplicates
function getAllActiveRooms() {
    //Array.from() created an array from the objects passed as argument
    //map() returns an array of the rooms of each user - there might be duplicates using map()
     //to prevent duplicates we are creating a new set from map
     //so array.from() will be needed to convert set into array
    return Array.from(new Set (UsersState.users.map(user => user.room)))
}