
//no long using websocket, using socket.io instead
const socket = new io('ws://localhost:3500')

//adding query selectors 
//selects activity class that we set up - a paragraphe element
const activity = document.querySelector('.activity')
const msgInput = document.querySelector('input') //points to message entered by user, msgInput is also used in sendMessage(e) function


function sendMessage(e) {
    e.preventDefault()
    //if value was inputeed in html form
    if(msgInput.value){
        //instead of send, we are emitting a message
        socket.emit('message',msgInput.value) //sending exact same message received to socket
        msgInput.value = "" //resetting message, erasing whats in input
    }
    msgInput.focus()
}
//using above function a couple of times
//when the user presses 'submit' button in form, it will call sendMessage function
document.querySelector('form')
  .addEventListener('submit', sendMessage) //addEventListener isten for specfic action (pressing submit) and does a function when it occurs

//listen for messages
//No longer using websockets, instead of addEvenetListener, we are using 'on' - when server receives message, on() calls specified function
socket.on("message", (data) => {
    activity.textContent = ""
    const li = document.createElement('li') //creating list element that will contain message from server
    li.textContent = data //making list contain that message
    document.querySelector('ul').appendChild(li) //grabbing unorders list from original html code and appedning new message to it
})

//adding an event listener to msg input
//listening for key press event - anonymous function will execute if event trigerred
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', socket.id.substring(0,5))
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
