import mongoose from 'mongoose'

const contributionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    tip: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Contribution', contributionSchema)