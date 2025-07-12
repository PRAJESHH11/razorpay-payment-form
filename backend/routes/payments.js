import express from 'express'
import { createOrder, verifyPayment } from '../controllers/paymentController.js'
import { validatePaymentData } from '../middleware/validation.js'

const router = express.Router()

router.post('/create-order', validatePaymentData, createOrder)
router.post('/verify-payment', verifyPayment)

export default router