const socket = io()

const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true, // ignore the & , = in the queries
})

//join chatroom
socket.emit("joinRoom", { username, room })

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

// catch the message comming from the 'message channel' and print it to the google chrown console
//Message channel from server
socket.on("message", (message) => {
  console.log(message)
  outputMessage(message)

  //scroll down to the latest chat every time
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault()
  //get message text
  const msg = e.target.elements.msg.value // input tag id === msg in chat.html so we use elements.msg here

  //emitting message to the server
  socket.emit("chatMessage", msg)

  //clear input
  e.target.elements.msg.value = ""
  e.target.elements.msg.focus()
})

//message output to dom
function outputMessage(message) {
  const div = document.createElement("div") //create a div tag
  div.classList.add("message") //in chat html we find each div tag for chat message have a 'message' style class
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`
  document.querySelector(".chat-messages").appendChild(div)
  //found the tag with chat-messages class name
  // difference with getelementbyid is : getElementById is finding tag with id name; querySelector is with class name
}

// add room name to dom
function outputRoomName(room) {
  roomName.innerText = room
}

//add users to dom
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `
}
