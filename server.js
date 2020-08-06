const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

//run when client connet
io.on("connection", (socket) => {
  // To the single client
  socket.emit("message", "Welcome to chat box")
  // broadcast when a user connects
  // this will broadcast to everyuser except the user thats connecting
  socket.broadcast.emit("message", "a user has joined the chat")

  // broadcast to everyone including the user thats connecting
  // io.emit()

  //Runs when client disconnect
  socket.on("disconnect", () => {
    io.emit("message", "a user has left the chat")
  })
  //listen for chatMessage emit channel at the serverside
  socket.on("chatMessage", (msg) => {
    //then emit this messge from server to everyone
    // so all the message channel in main.js will catch the message
    io.emit("message", msg)
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
