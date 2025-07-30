// import mongoose from 'mongoose'

// const contributionSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true
//     },
//     phone: {
//         type: String,
//         required: true
//     },
//     address: {
//         type: String
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     tip: {
//         type: Number,
//         default: 0
//     },
//     totalAmount: {
//         type: Number,
//         required: true
//     },
//     anonymous: {
//         type: Boolean,
//         default: false
//     },
//     orderId: {
//         type: String,
//         required: true
//     },
//     paymentId: {
//         type: String
//     },
//     paymentStatus: {
//         type: String,
//         enum: ['pending', 'completed', 'failed'],
//         default: 'pending'
//     },
//     razorpayOrderId: {
//         type: String
//     },
//     razorpayPaymentId: {
//         type: String
//     },
//     razorpaySignature: {
//         type: String
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// })

// export default mongoose.model('Contribution', contributionSchema)

const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  // Link to user who made the contribution
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ]
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  // Contribution Details
  amount: {
    type: Number,
    required: [true, 'Contribution amount is required'],
    min: [1, 'Amount must be at least ₹1'],
    max: [1000000, 'Amount cannot exceed ₹10,00,000']
  },
  contributionType: {
    type: String,
    required: [true, 'Contribution type is required'],
    enum: {
      values: ['one-time', 'monthly', 'quarterly', 'yearly'],
      message: 'Contribution type must be one-time, monthly, quarterly, or yearly'
    }
  },
  category: {
    type: String,
    required: [true, 'Contribution category is required'],
    enum: {
      values: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'],
      message: 'Please select a valid category'
    }
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Payment Information
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: [true, 'Razorpay Order ID is required'],
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'upi', 'other']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Receipt Information
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: {
    type: Date
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  source: {
    type: String,
    default: 'website'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contributionSchema.index({ userId: 1, createdAt: -1 });
contributionSchema.index({ email: 1, createdAt: -1 });
contributionSchema.index({ paymentStatus: 1, createdAt: -1 });
contributionSchema.index({ category: 1, createdAt: -1 });

// Virtual for formatted amount
contributionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Pre-save middleware to update timestamp
contributionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate receipt number for completed payments
  if (this.paymentStatus === 'completed' && !this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP${year}${month}${day}${random}`;
  }
  
  next();
});

module.exports = mongoose.model('Contribution', contributionSchema);