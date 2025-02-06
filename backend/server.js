const express = require('express');
const app = express();
const socket = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();
const SERVER_PORT = process.env.PORT || 8000;

// Initiate MongoDB connection
connectDB();

// Start server
const server = app.listen(SERVER_PORT, () => {
    console.log(`Chat Server running on http://localhost:${SERVER_PORT}`);
});

const io = socket(server);

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve login page from root
app.use(express.static(path.join(__dirname, '../view')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../view/login.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io implementation
io.on('connection', (socket) => {
    console.log(`New Socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });

    socket.on('message', (data) => {
        console.log(`Message from ${socket.id}: ${data}`);
    });

    socket.on('chat_message', (data) => {
        data.clientId = socket.id;
        console.log(JSON.stringify(data));
        //socket.emit('chat_message', data)
        io.emit('chat_message', data)
        //socket.broadcast.emit('chat_message', data)
    });

    socket.on('join_group', (roomName) => {
        console.log(`User ${socket.id} joined room ${roomName}`);
        socket.join(roomName);
    });

    socket.on('leave_group', (roomName) => {
        socket.leave(roomName);
    });

    socket.on('group_message', (data) => {
        console.log(`User ${socket.id} sent a message to room ${data.group}`);
        data.senderId = socket.id;
        io.to(data.group).emit('group_message', data);
    });

    socket.on('typing', (data) => {
        io.to(data.room).emit('typing', data);
    });
});