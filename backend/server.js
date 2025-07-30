const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay'); // *** UNCOMMENTED - RAZORPAY REQUIRED ***
require('dotenv').config();

const impactRoutes = require('./routes/impactRoutes');



const app = express();

// *** UPDATED CORS CONFIGURATION - THIS FIXES YOUR CORS ERROR ***
app.use(cors({
  origin: [
    'http://localhost:3000',      // React default port
    'http://localhost:5173',      // Vite default port  
    'http://127.0.0.1:3000',      // Alternative localhost
    'http://127.0.0.1:5173',      // Alternative localhost for Vite
    process.env.FRONTEND_URL      // Production URL from env
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // *** ADDED MORE HTTP METHODS ***
  allowedHeaders: [                                               // *** ADDED EXPLICIT HEADERS ***
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// *** HANDLE PREFLIGHT REQUESTS - IMPORTANT FOR CORS ***
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// *** INITIALIZE RAZORPAY - UNCOMMENTED ***
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Razorpay Payment Form API is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// *** HEALTH CHECK FOR DEBUGGING - NEW ROUTE ***
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb_connected: mongoose.connection.readyState === 1,
    cors_enabled: true,
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), // *** ADDED RAZORPAY CHECK ***
    timestamp: new Date().toISOString()
  });
});

// *** AUTH ROUTES ***
app.use('/api/auth', require('./routes/auth'));

app.use('/api/auth', require('./routes/googleAuth'));

// Other API Routes
app.use('/api/contributions', require('./routes/contributions'));

// Add the route middleware
app.use('/api', impactRoutes);

// *** RAZORPAY ROUTES - UNCOMMENTED AND ENHANCED ***
// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    console.log('📦 Received order request:', req.body);
    
    const { amount, currency = 'INR' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid amount is required',
        received: amount 
      });
    }

    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    console.log('🎯 Creating Razorpay order with options:', options);
    
    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created:', order);

    res.json({
      success: true,
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order',
      details: error.message,
    });
  }
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    console.log('🔍 Verifying payment:', req.body);
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userDetails 
    } = req.body;

    // TODO: Add proper signature verification here using crypto
    // For now, just return success for testing
    
    console.log('✅ Payment verified successfully');
    
    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment verification failed',
      details: error.message
    });
  }
});

// Razorpay health check
app.get('/api/razorpay/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Razorpay endpoints are working!',
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    timestamp: new Date().toISOString()
  });
});

// *** ERROR HANDLING MIDDLEWARE ***
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // *** LOG CONFIGURATION STATUS ***
  console.log('🔧 CORS configured for origins:', [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ]);
  
  console.log('💳 Razorpay Configuration:');
  console.log('  Key ID:', !!process.env.RAZORPAY_KEY_ID);
  console.log('  Key Secret:', !!process.env.RAZORPAY_KEY_SECRET);
});

module.exports = app;


