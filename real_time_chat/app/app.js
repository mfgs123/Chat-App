
//creating websocket for client side / browser cool
const socket = new WebSocket('ws://localhost:3001')

function sendMessage(e) {
    e.preventDefault()
    const input = document.querySelector('input')
    //if value was inputeed in html form
    if(input.value){
        socket.send(input.value) //sending exact same message received to socket
        input.value = "" //resetting message, erasing whats in input
    }
    input.focus()
}
//using above function a couple of times
//when the user presses 'submit' button in form, it will call sendMessage function
document.querySelector('form')
  .addEventListener('submit', sendMessage) //addEventListener isten for specfic action (pressing submit) and does a function when it occurs

//Listening for messages
socket.addEventListener("message", ({ data }) => {
    const li = document.createElement('li') //creating list element that will contain message from server
    li.textContent = data //making list contain that message
    document.querySelector('ul').appendChild(li) //grabbing unorders list from original html code and appedning new message to it
})
