// src/utils/api.js

const API_BASE_URL = 'http://localhost:5000';

// Helper function to make API calls
const makeRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/health`);
    console.log('Backend connection test:', response);
    return response;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw new Error('Cannot connect to backend server. Please ensure it\'s running on port 5000.');
  }
};

// Create Razorpay order
export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    
    const response = await makeRequest(`${API_BASE_URL}/api/create-order`, {
      method: 'POST',
      body: JSON.stringify({
        amount: orderData.amount,
        currency: 'INR',
        userDetails: orderData
      }),
    });

    console.log('Order created successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    console.log('Verifying payment:', paymentData);
    
    const response = await makeRequest(`${API_BASE_URL}/api/verify-payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    console.log('Payment verification result:', response);
    return response;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};