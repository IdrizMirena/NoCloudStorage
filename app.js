const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Static files dhe template engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Ruajtja e dhomave në memorie
const rooms = new Set();

// Rruga për faqen kryesore
app.get('/', (req, res) => {
    res.render('index', { rooms: Array.from(rooms) });
});

// Krijimi ose bashkimi në dhomë
app.get('/room/:room', (req, res) => {
    const room = req.params.room;
    if (!rooms.has(room)) {
        rooms.add(room);
    }
    res.render('room', { room });
});

// Socket.IO për komunikim në kohë reale
io.on('connection', (socket) => {
    console.log('Një përdorues u lidh.');

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Përdoruesi u bashkua në dhomën: ${room}`);
    });

    socket.on('chat-message', ({ room, message }) => {
        io.to(room).emit('chat-message', message);
    });

    socket.on('image-upload', ({ room, imageData }) => {
        // Transmeto skedarin e ngarkuar si "base64"
        io.to(room).emit('image-upload', imageData);
    });
});

// Ndezi serverin
const PORT = 3000;
server.listen(PORT, () => console.log(`Serveri është ndezur në http://localhost:${PORT}`));
