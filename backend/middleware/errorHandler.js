export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message)
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    })
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value entered'
    })
  }

  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  })
}