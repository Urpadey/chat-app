const users = []



const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing User
    const existingUser = users.find((user) => user.room === room && user.username === username)
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store user

    const user = {
        id, username, room
    }
    users.push(user)

    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        // splice returns an array
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find(user => user.id === id)
    if (!user) {
        return {
            error: 'user does not exist'
        }
    }
    return { user }
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter(user => user.room === room)
    if (usersInRoom.length === 0) {
        return {
            error: 'no user in this room'
        }
    }
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}