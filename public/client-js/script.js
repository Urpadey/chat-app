const socket = io()

// query selectors
const submitBtn = document.querySelector('.submit')
const shareBtn = document.querySelector('.shareBtn')
const input = document.getElementById('message')
const messages = document.getElementById('messages')

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
    // new message element
    const newMessage = messages.lastElementChild

    // height of new message
    const newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height in viewport
    const visibleHeight = messages.offsetHeight

    // height of message container
    const containerHeight = messages.scrollHeight


    // how far have we scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('locationMessage', ({ text: url, createdAt, username }) => {
    const html = Mustache.render(urlTemplate, {
        url,
        description: 'current location',
        createdAt: moment(createdAt).format('h:mm a'),
        username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('message', ({ text, createdAt, username }) => {
    const html = Mustache.render(messageTemplate, {
        message: text,
        createdAt: moment(createdAt).format('h:mm a'),
        username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    // side bar innerhtml
    document.querySelector('.chat__sidebar').innerHTML = html

})

const sendMessage = (e) => {
    // e.preventDefault()
    let message = input.value
    if (!message) {
        return
    }
    submitBtn.setAttribute('disabled', 'disabled')

    socket.emit('message', message, (error) => {
        submitBtn.removeAttribute('disabled')
        input.value = ''
        input.focus()
        if (error) {
            return 
        }

    })

}

const shareLocation = () => {
    shareBtn.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('geolocation is not supported by your browser')
    }
    try {
        navigator.geolocation.getCurrentPosition((position) => {
            if (!position) {
                shareBtn.removeAttribute('disabled')
                throw new Error('Check your network connection or enable access to location')
            }
            const { coords } = position
            const { latitude, longitude } = coords
            socket.emit('position', { latitude, longitude }, (msg) => {
                shareBtn.removeAttribute('disabled')
                input.focus()
            })
        })
    } catch (error) {
        return error.message
    }

}

submitBtn.addEventListener('click', sendMessage)
shareBtn.addEventListener('click', shareLocation)

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})