const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const storeRoutes = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin:"*",
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve React source files for development
app.use('/src', express.static(path.join(__dirname, 'src')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;
