const express = require('express');
const app = express();
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const SERVER_PORT = process.env.PORT || 8000;

// Initiate MongoDB connection
connectDB();

const server = app.listen(SERVER_PORT, () => {
    console.log(`Chat Server running on http://localhost:${SERVER_PORT}`);
});

const io = socketIo(server);

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');