const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

// Import routes
const exitLogRoutes = require('./src/routes/exitLogRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

// Use routes
app.use('/api/exit-logs', exitLogRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/payments', paymentRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('NS-FOUNDATION Backend API is running!');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
