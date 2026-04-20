const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initDB } = require('./utils/db');

// Route imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const tokenRoutes = require('./routes/tokens');
const noticeRoutes = require('./routes/notices');
const chatbotRoutes = require('./routes/chatbot');
const lostfoundRoutes = require('./routes/lostfound');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const libraryRoutes = require('./routes/library');
const analyticsRoutes = require('./routes/analytics');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
initDB();

// Connect MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://campusx:12345678@cluster0.gag59nu.mongodb.net/campusx";
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB Connected via Mongoose');
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('CampusX API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
