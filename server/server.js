require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => res.send('EduCraft API is running'));

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educraft';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected successfully to MongoDB ✅');
    app.listen(PORT, () => {
      console.log(`Server running successfully on port ${PORT} ✅`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB ❌:', error.message);
  });
