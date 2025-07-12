// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const Razorpay = require('razorpay');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Middleware
// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:3001"], // Add your frontend URLs
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('✅ MongoDB connected successfully'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK', 
//     message: 'Server is running',
//     razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
//     mongodb_connected: mongoose.connection.readyState === 1
//   });
// });

// // Create Razorpay order
// app.post('/api/create-order', async (req, res) => {
//   try {
//     console.log('📦 Received order request:', req.body);
    
//     const { amount, currency = 'INR' } = req.body;
    
//     if (!amount || amount <= 0) {
//       return res.status(400).json({ 
//         error: 'Valid amount is required',
//         received: amount 
//       });
//     }

//     // Razorpay expects amount in paise (smallest currency unit)
//     const amountInPaise = Math.round(amount * 100);
    
//     const options = {
//       amount: amountInPaise,
//       currency,
//       receipt: `receipt_${Date.now()}`,
//       payment_capture: 1, // Auto capture payment
//     };

//     console.log(' Creating Razorpay order with options:', options);
    
//     const order = await razorpay.orders.create(options);
    
//     console.log(' Razorpay order created:', order);

//     // Return order details to frontend
//     res.json({
//       id: order.id,
//       currency: order.currency,
//       amount: order.amount,
//       key: process.env.RAZORPAY_KEY_ID, // Send key for frontend
//       success: true
//     });

//   } catch (error) {
//     console.error(' Error creating order:', error);
//     res.status(500).json({ 
//       error: 'Failed to create order',
//       details: error.message,
//       success: false
//     });
//   }
// });

// // Verify payment
// app.post('/api/verify-payment', async (req, res) => {
//   try {
//     console.log(' Verifying payment:', req.body);
    
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature,
//       userDetails 
//     } = req.body;
    
//     // Here you would verify the signature using crypto
//     // For now, just return success
//     // In production, add proper signature verification
    
//     console.log(' Payment verified successfully');
    
//     // Save payment details to database here if needed
    
//     res.json({ 
//       success: true, 
//       message: 'Payment verified successfully',
//       payment_id: razorpay_payment_id,
//       order_id: razorpay_order_id
//     });

//   } catch (error) {
//     console.error(' Error verifying payment:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Payment verification failed',
//       details: error.message
//     });
//   }
// });

// // Test route
// app.get('/api/test', (req, res) => {
//   res.json({ 
//     message: 'Backend is working!',
//     timestamp: new Date().toISOString(),
//     env_check: {
//       razorpay_key_id: !!process.env.RAZORPAY_KEY_ID,
//       razorpay_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
//       mongodb_uri: !!process.env.MONGODB_URI
//     }
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(' Unhandled error:', err);
//   res.status(500).json({ 
//     error: 'Internal server error',
//     message: err.message
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     error: 'Route not found',
//     path: req.originalUrl 
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(` Server running on port ${PORT}`);
//   console.log(` Health check: http://localhost:${PORT}/api/health`);
//   console.log(` Test endpoint: http://localhost:${PORT}/api/test`);
  
//   // Log environment status
//   console.log('\n Environment Status:');
//   console.log(' MongoDB URI:', !!process.env.MONGODB_URI);
//   console.log(' Razorpay Key ID:', !!process.env.RAZORPAY_KEY_ID);
//   console.log(' Razorpay Secret:', !!process.env.RAZORPAY_KEY_SECRET);
// });


// // Add this after your other middleware in server.js
// const path = require('path');

// // Serve static files from React build
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// // Handle React routing, return all requests to React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const path = require('path'); // Move this to the top

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "https://razorpay-payment-form-production.up.railway.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes (keep these BEFORE the static file serving)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    mongodb_connected: mongoose.connection.readyState === 1
  });
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    console.log('📦 Received order request:', req.body);
    
    const { amount, currency = 'INR' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
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
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
      success: true
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message,
      success: false
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

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    env_check: {
      razorpay_key_id: !!process.env.RAZORPAY_KEY_ID,
      razorpay_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
      mongodb_uri: !!process.env.MONGODB_URI
    }
  });
});

// Serve static files from React build (PRODUCTION)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing - return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // Development 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  
  console.log('\n📋 Environment Status:');
  console.log('✅ MongoDB URI:', !!process.env.MONGODB_URI);
  console.log('✅ Razorpay Key ID:', !!process.env.RAZORPAY_KEY_ID);
  console.log('✅ Razorpay Secret:', !!process.env.RAZORPAY_KEY_SECRET);
  console.log('✅ NODE_ENV:', process.env.NODE_ENV || 'development');
});