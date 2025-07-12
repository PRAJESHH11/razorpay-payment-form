export const validateForm = (formData, selectedAmount, customAmount, selectedCountry) => {
  const errors = {}
  
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
    errors.name = 'Name can only contain letters and spaces'
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.phone.trim()) {
    errors.phone = 'Mobile number is required'
  } else {
    const phoneNumber = formData.phone.replace(/\D/g, '')
    if (selectedCountry === 'IN' && phoneNumber.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number'
    } else if (selectedCountry === 'US' && phoneNumber.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit US phone number'
    } else if (phoneNumber.length < 7 || phoneNumber.length > 15) {
      errors.phone = 'Please enter a valid phone number'
    }
  }

  if (!formData.address.trim()) {
    errors.address = 'Address is required'
  } else if (formData.address.trim().length < 10) {
    errors.address = 'Please provide a complete address (minimum 10 characters)'
  }

  if (selectedAmount === 'other') {
    if (!customAmount || parseInt(customAmount) < 1) {
      errors.amount = 'Please enter a valid amount'
    } else if (parseInt(customAmount) < 100) {
      errors.amount = 'Minimum contribution amount is ₹100'
    } else if (parseInt(customAmount) > 500000) {
      errors.amount = 'Maximum contribution amount is ₹5,00,000'
    }
  }
  
  return errors
}