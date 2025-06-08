
//no long using websocket, using socket.io instead
const socket = new io('ws://localhost:3500')

//adding query selectors 


//msgInput uses a selector that only select one single selector - the form one for the message - that was the only one before
//however, now we have 2 addtiional inputs for name id and chat room number
const msgInput = document.querySelector('#message') //points to message entered by user, msgInput is also used in sendMessage(e) function
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector("#room")

//selects activity class that we set up - a paragraphe element
const activity = document.querySelector('.activity')

//adding more query selectors for classes user-list and room-list that we set up as paragraph elements in html form
const userList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')



function sendMessage(e) {
    e.preventDefault() //preventDefault() cancels even if it is cancelable - since we are using it with 'submit' button - it will prevent it from submitting form - do the following code instead
    //if value was inputeed in html form 
   
    //checking that both message, name and chat room inputs have some data in them
    if(msgInput.value && nameInput.value && chatRoom.value){
        //we want to emit an object that have more than one value
        socket.emit('message', {
            name: nameInput.value, //object keys - name and text can work with or without double quotes
            text: msgInput.value
        }) 
        msgInput.value = "" //resetting message, erasing whats in input
    }
    msgInput.focus()
}

//function thats called when user enters a chatroom - it will emit the user id and 
function enterRoom(e) {
    e.preventDefault()
    //this time checking that name and chatroom fields are not empty
    if(nameInput.value && chatRoom.value){
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })

    }

}

//using above function a couple of times
//when the user presses 'submit' button in form with class "form-msg", it will call sendMessage function
document.querySelector('.form-msg')
  .addEventListener('submit', sendMessage) //addEventListener isten for specfic action (pressing submit) and does a function when it occurs

//adding another event listen, that performs enterRoom() function when user presses jon button
document.querySelector('.form-join')
 .addEventListener('submit', enterRoom)

//adding an event listener to msg input - we dont have to do document.querySelector - since msgInput was already selected in this case
//listening for key press event - anonymous function will execute if event trigerred - letting users know what user is currently typing

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

//listen for messages
//No longer using websockets, instead of addEvenetListener, we are using 'on' - when server receives message, on() calls specified function
socket.on("message", (data) => {
    activity.textContent = ""
    const li = document.createElement('li') //creating list element that will contain message from server
    li.textContent = data //making list contain that message
    document.querySelector('ul').appendChild(li) //grabbing unorders list from original html code and appedning new message to it
})



//setting up timer, if user takes too long typing a message, this ight mean they gave up and dont want to send message anymore
//when timer runs out, the user is typing... message gets removed
let activityTimer
//socket.on that listens for activity event
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    //it resets timer every 3 seconds as long as activty detected
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = "" //text is typing... gets resetted to empty string if user deletes message 
    },3000)
})
