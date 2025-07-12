const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested')
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    message: 'Backend is working!'
  })
})

// Mock contributions endpoint
app.get('/api/contributions', (req, res) => {
  console.log('📊 Contributions requested')
  const mockContributions = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      amount: 2500,
      tip: 18,
      totalAmount: 2950,
      paymentStatus: 'completed',
      anonymous: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Anonymous',
      email: 'anonymous@example.com',
      phone: '9876543211',
      amount: 1000,
      tip: 10,
      totalAmount: 1100,
      paymentStatus: 'completed',
      anonymous: true,
      createdAt: new Date().toISOString()
    }
  ]
  
  res.json({
    success: true,
    count: mockContributions.length,
    contributions: mockContributions
  })
})

// Mock stats endpoint
app.get('/api/stats', (req, res) => {
  console.log('📈 Stats requested')
  const mockStats = {
    totalContributions: 15,
    totalAmount: 45000,
    recentContributions: [
      {
        _id: '1',
        name: 'Recent Donor 1',
        totalAmount: 2950,
        anonymous: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Anonymous',
        totalAmount: 1100,
        anonymous: true,
        createdAt: new Date().toISOString()
      }
    ]
  }
  
  res.json({
    success: true,
    stats: mockStats
  })
})

// Create order endpoint
app.post('/api/create-order', (req, res) => {
  try {
    console.log('📦 Create order request:', req.body)
    
    const { name, email, phone, amount, tip, anonymous, address } = req.body
    
    if (!name || !email || !phone || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, phone, amount' 
      })
    }
    
    const tipAmount = Math.round((amount * (tip || 0)) / 100)
    const totalAmount = amount + tipAmount
    
    // Mock order response
    const mockOrder = {
      orderId: `order_${Date.now()}`,
      amount: totalAmount * 100,
      currency: 'INR',
      key: 'mock_key_for_demo',
      name: 'Fundraiser Contribution',
      description: 'Thank you for your generous contribution (DEMO MODE)'
    }
    
    console.log('✅ Mock order created:', mockOrder)
    res.json(mockOrder)
    
  } catch (error) {
    console.log('❌ Error in create-order:', error)
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    })
  }
})

// Verify payment endpoint
app.post('/api/verify-payment', (req, res) => {
  console.log('🔐 Payment verification (mock):', req.body)
  res.json({
    success: true,
    message: 'Payment verified successfully (MOCK MODE)',
    mock: true
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.log('💥 Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

// 404 handler
app.use('*', (req, res) => {
  console.log('🔍 404 - Route not found:', req.method, req.originalUrl)
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Complete mock server running on http://localhost:${PORT}`)
  console.log(`📍 Health: http://localhost:${PORT}/api/health`)
  console.log(`📊 Contributions: http://localhost:${PORT}/api/contributions`)
  console.log(`📈 Stats: http://localhost:${PORT}/api/stats`)
})