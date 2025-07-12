import React, { useState } from 'react'
import AmountSelector from './AmountSelector'
import TipSection from './TipSection'
import FormFields from './FormFields'
import { validateForm } from '../utils/validation'
import { createOrder, verifyPayment } from '../utils/api'

const PaymentForm = () => {
  const [selectedAmount, setSelectedAmount] = useState(2500)
  const [customAmount, setCustomAmount] = useState('')
  const [tipPercentage, setTipPercentage] = useState(18)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    anonymous: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const contributionAmount = selectedAmount === 'other' ? parseInt(customAmount) || 0 : selectedAmount
  const tipAmount = Math.round((contributionAmount * tipPercentage) / 100)
  const totalAmount = contributionAmount + tipAmount

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        console.log('Razorpay already loaded from HTML script');
        resolve(true);
        return;
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        console.log('Razorpay script loaded dynamically');
        resolve(true);
      }
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      }
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    console.log('Starting payment process...')

    const validationErrors = validateForm(formData, selectedAmount, customAmount, 'IN')

    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors)
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      console.log('Checking backend connection...')

      try {
        const healthResponse = await fetch('http://localhost:5000/api/health')
        if (!healthResponse.ok) {
          throw new Error('Backend health check failed')
        }
        console.log('Backend is reachable')
      } catch (healthError) {
        console.error('Backend not reachable:', healthError)
        alert('Cannot connect to server. Please make sure:\n\n1. Backend server is running on port 5000\n2. Run: npm run dev in backend folder\n3. Check if MongoDB is running')
        setIsLoading(false)
        return
      }

      console.log('Loading Razorpay script...')
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.')
        setIsLoading(false)
        return
      }
      console.log('Razorpay script loaded')

      console.log('Checking Razorpay availability...')
      console.log('Razorpay available:', !!window.Razorpay)
      if (window.Razorpay) {
        console.log('Razorpay version:', window.Razorpay.version || 'version not available')
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded properly')
      }

      const orderData = {
        name: formData.anonymous ? 'Anonymous' : formData.name,
        email: formData.anonymous ? 'anonymous@example.com' : formData.email,
        phone: formData.phone,
        amount: totalAmount,
        tip: tipPercentage,
        anonymous: formData.anonymous,
        address: formData.address || ''
      }

      console.log('Creating order with data:', orderData)

      const order = await createOrder(orderData)
      console.log('Order created:', order)

      if (!order.id || !order.key) {
        throw new Error('Invalid order response from backend')
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Fundraiser Contribution',
        description: 'Contribution to Fundraiser',
        order_id: order.id,
        handler: async function (response) {
          console.log('Payment completed:', response)
          try {
            const verifyResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userDetails: orderData
            })

            if (verifyResult.success) {
              alert('Payment successful! Thank you for your contribution.')
              setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                anonymous: false
              })
              setSelectedAmount(2500)
              setCustomAmount('')
              setTipPercentage(18)
              setErrors({})
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            alert(`Payment verification failed: ${error.message}`)
          }
        },
        prefill: {
          name: formData.anonymous ? '' : formData.name,
          email: formData.anonymous ? '' : formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#1ba89a'
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled by user')
            setIsLoading(false)
          }
        }
      }

      console.log('Opening Razorpay checkout with options:', {
        ...options,
        key: options.key ? 'KEY_PRESENT' : 'KEY_MISSING',
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id
      })
      
      if (!options.key) {
        throw new Error('Razorpay key not found in order response')
      }

      console.log('Creating Razorpay instance...')
      
      try {
        const razorpay = new window.Razorpay(options)
        console.log('Razorpay instance created successfully:', razorpay)
        
        console.log('Opening Razorpay checkout...')
        razorpay.open()
        console.log('Razorpay.open() called successfully')
      } catch (razorpayError) {
        console.error('Error with Razorpay:', razorpayError)
        throw new Error(`Razorpay error: ${razorpayError.message}`)
      }

    } catch (error) {
      console.error('Payment process error:', error)

      let errorMessage = 'Something went wrong. Please try again.'

      if (error.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to server.\n\nPlease make sure:\nBackend server is running (npm run dev)\nMongoDB is running\nCheck browser console for details'
      } else if (error.message.includes('Failed to create order')) {
        errorMessage = `Failed to create order.\n\nError: ${error.message}\n\nPlease check:\nYour Razorpay credentials\nBackend server logs`
      } else if (error.message.includes('Razorpay key not found')) {
        errorMessage = 'Razorpay configuration missing.\n\nPlease check your backend Razorpay configuration'
      } else if (error.message.includes('Razorpay SDK not loaded')) {
        errorMessage = 'Razorpay SDK failed to load.\n\nPlease check your internet connection and try again'
      } else if (error.message.includes('Razorpay error')) {
        errorMessage = `Razorpay checkout error.\n\n${error.message}\n\nThis might be due to popup blocker. Please allow popups for this site.`
      }

      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: 'white' }}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card card-payment" style={{
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-end mb-3">
                <button type="button" className="btn-close" style={{ fontSize: '14px' }}></button>
              </div>

              <div className="text-center mb-4">
                <h4 className="fw-semibold mb-3" style={{ 
                  fontSize: '18px',
                  color: '#1ba89a'
                }}>
                  Choose a contribution amount
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                  Most Contributors contribute approx ₹2500 to this Fundraiser
                </p>
              </div>

              <AmountSelector
                selectedAmount={selectedAmount}
                setSelectedAmount={setSelectedAmount}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
                errors={errors}
              />

              <TipSection
                tipPercentage={tipPercentage}
                setTipPercentage={setTipPercentage}
                contributionAmount={contributionAmount}
                totalAmount={totalAmount}
              />

              <FormFields
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              <div className="text-center mb-3">
                <button
                  className="btn text-white btn-rounded"
                  onClick={handlePayment}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#1ba89a',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '500',
                    width: '100%',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#159085'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1ba89a'}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    `Proceed To Contribute ₹${totalAmount}`
                  )}
                </button>
              </div>

              <div className="text-center">
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  By continuing, you agree to our{' '}
                  <a href="#" style={{ color: '#1ba89a', textDecoration: 'none' }}>Terms of Service</a> and{' '}
                  <a href="#" style={{ color: '#1ba89a', textDecoration: 'none' }}>Privacy Policy</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm