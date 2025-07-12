export const validatePaymentData = (req, res, next) => {
  const { name, email, phone, amount } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required')
  }

  if (!phone || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
    errors.push('Valid phone number is required')
  }

  if (!amount || amount < 100 || amount > 500000) {
    errors.push('Amount must be between ₹100 and ₹5,00,000')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    })
  }

  next()
}