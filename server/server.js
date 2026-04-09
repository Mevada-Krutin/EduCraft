require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/payments');
const razorpayRoutes = require('./routes/razorpay');
const path = require('path');

const app = express();

// Stripe Webhook needs the raw body buffer, so must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/payments').webhook);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Make uploads folder static so the frontend can retrieve images
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

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
