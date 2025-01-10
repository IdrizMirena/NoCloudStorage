const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const rooms = new Set();

app.get('/', (req, res) => {
    res.render('index', { rooms: Array.from(rooms) });
});

app.get('/room/:room', (req, res) => {
    const room = req.params.room;
    if (!rooms.has(room)) {
        rooms.add(room);
    }
    res.render('room', { room });
});

io.on('connection', (socket) => {
    console.log('Një përdorues u lidh.');

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`useri u bashkua ne room: ${room}`);
    });

    socket.on('chat-message', ({ room, message }) => {
        io.to(room).emit('chat-message', message);
    });

    socket.on('image-upload', ({ room, imageData }) => {
        // base 64
        io.to(room).emit('image-upload', imageData);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Serveri u dhez ndezur ne portin http://localhost:${PORT}`));
