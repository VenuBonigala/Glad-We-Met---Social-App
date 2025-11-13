import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';

import connectDB from './db.js';
import { socketHandler } from './socketHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new SocketIO(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.set('socketio', io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

socketHandler(io);

mongoose.connection.once('open', () => {
  console.log('MongoDB connected.');
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});