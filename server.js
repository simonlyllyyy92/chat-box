const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
// setting up a wrapper for the message
const formatMessage = require("./utils/messages")
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

const botName = "chatBox bot"

//run when client connet
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // To the single client
    socket.emit("message", formatMessage(botName, "Welcome to Chat Box"))

    // broadcast when a user connects
    // this will broadcast to everyuser except the user thats connecting
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joint the chat`)
      )
    //send user room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // broadcast to everyone including the user thats connecting
  // io.emit()

  //listen for chatMessage emit channel at the serverside
  socket.on("chatMessage", (msg) => {
    //get the current user with the socket id
    const user = getCurrentUser(socket.id)
    //then emit this messge from server to everyone
    // so all the message channel in main.js will catch the message
    io.to(user.room).emit("message", formatMessage(`${user.username}`, msg))
  })

  //Runs when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      )
      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
