const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// create the app
const app = express()
const server = http.createServer(app)

const io = socketio(server)

// define paths
const publicDir = path.join(__dirname, '../public')



// serve up the static directory
app.use(express.static(publicDir))


io.on('connection', (socket) => {



    socket.on('message', (message, callback) => {
        const { user, error } = getUser(socket.id)
        // checking for Profanity in words

        if (error) {
            return callback(error)
        }

        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback(
                'Profanity is not allowed'
            )
        }
        // every users including main user
        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback()
    })
    socket.on('join', ({ username, room }, callback) => {
        // add user to the room
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })
        if (error) {
            return callback(error)

        }
        socket.join(user.room)
        // to a particular user
        socket.emit('message', generateMessage('welcome', 'Admin'))
        // to a other users not the main user
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined !`, 'Admin'))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()




    })
    socket.on('position', (position, callback) => {
        const { user, error } = getUser(socket.id)
        if (error) {
            callback(error)
        }
        const { latitude } = position
        const { longitude } = position
        io.to(user.room).emit('locationMessage', generateMessage(`https://google.com/maps?q=${latitude},${longitude}`, user.username))
        callback('Location shared')



    })

    socket.on('disconnect', () => {
        // removeUser when the disconnect
        const user = removeUser(socket.id)
        // checks if there was an actual user
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})



server.listen(process.env.PORT, () => {
    `listening on port ${process.env.PORT} !`
})