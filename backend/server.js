const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== DATABASE CONNECTION =====
const seedAdmin = require('./utils/seedAdmin');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected!');
    seedAdmin();
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const notifRoutes = require('./routes/notifications');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FRIENDIX API is running!', timestamp: new Date() });
});

// ===== SOCKET.IO: Real-time Chat =====
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('user-online', (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit('online-users', Object.keys(onlineUsers));
  });

  socket.on('send-message', ({ senderId, receiverId, content }) => {
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive-message', {
        senderId, content, createdAt: new Date(),
      });
    }
  });

  socket.on('send-notification', ({ userId, notification }) => {
    const userSocketId = onlineUsers[userId];
    if (userSocketId) {
      io.to(userSocketId).emit('receive-notification', notification);
    }
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(onlineUsers).find(k => onlineUsers[k] === socket.id);
    if (userId) delete onlineUsers[userId];
    io.emit('online-users', Object.keys(onlineUsers));
    console.log('🔌 User disconnected:', socket.id);
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 FRIENDIX Server running on port ${PORT}`);
});
