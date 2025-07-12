const Razorpay = require('razorpay');
const crypto = require('crypto');
// const Contribution = require('../models/Contribution'); // Uncomment when you have the model

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    console.log('📦 Creating order with request body:', req.body);
    
    const { name, email, phone, amount, tip, anonymous, address } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Valid amount is required',
        received: amount 
      });
    }

    // Calculate tip and total
    const tipPercentage = tip || 18;
    const tipAmount = Math.round((amount * tipPercentage) / 100);
    const totalAmount = amount + tipAmount;

    console.log('💰 Amount calculation:', {
      baseAmount: amount,
      tipPercentage,
      tipAmount,
      totalAmount
    });

    const options = {
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        name: anonymous ? 'Anonymous' : name,
        email: anonymous ? 'anonymous@example.com' : email,
        phone: phone || '',
        anonymous: String(anonymous || false)
      }
    };

    console.log('🎯 Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created:', order);

    // Save to database (uncomment when model is ready)
    /*
    const contribution = new Contribution({
      name: anonymous ? 'Anonymous' : name,
      email: anonymous ? 'anonymous@example.com' : email,
      phone: phone || '',
      address: address || '',
      amount,
      tip: tipPercentage,
      totalAmount,
      anonymous: anonymous || false,
      orderId: order.id,
      razorpayOrderId: order.id,
      paymentStatus: 'pending'
    });

    await contribution.save();
    console.log('💾 Contribution saved to database');
    */

    // Return response
    res.json({
      id: order.id,           // Important: use 'id' not 'orderId'
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: 'Fundraiser Contribution',
      description: 'Thank you for your generous contribution',
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
};

const verifyPayment = async (req, res) => {
  try {
    console.log('🔍 Verifying payment:', req.body);
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userDetails
    } = req.body;

    // Create signature for verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log('🔐 Signature verification:', {
      received: razorpay_signature,
      expected: expectedSign,
      matches: razorpay_signature === expectedSign
    });

    if (razorpay_signature === expectedSign) {
      // Update database (uncomment when model is ready)
      /*
      const contribution = await Contribution.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: 'completed'
        },
        { new: true }
      );

      if (!contribution) {
        return res.status(404).json({ error: 'Contribution not found' });
      }
      */

      console.log('✅ Payment verified successfully');

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      console.log('❌ Payment verification failed - signature mismatch');
      
      // Update database to failed (uncomment when model is ready)
      /*
      await Contribution.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'failed' }
      );
      */

      res.status(400).json({ 
        success: false,
        error: 'Payment verification failed - invalid signature' 
      });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify payment',
      details: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};