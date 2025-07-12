# Razorpay-payment-form
MERN Stack Payment Gateway with Razorpay Integration and this is my first mern app on github
A complete full-stack web application that demonstrates secure payment processing using the MERN stack and Razorpay payment gateway.

# Features

End-to-end Payment Flow: Order creation, payment processing, and verification
Razorpay Integration: Multiple payment options (Cards, UPI, Net Banking, Wallets)
Real-time Validation: Client and server-side form validation
Responsive Design: Clean, mobile-friendly interface
Secure Processing: Payment signature verification and error handling
MongoDB Integration: Persistent data storage with MongoDB Atlas

# Tech Stack
Frontend: React.js, Bootstrap CSS, Razorpay JavaScript SDK
Backend: Node.js, Express.js, Razorpay Node.js SDK
Database: MongoDB Atlas
Deployment: Railway/Netlify
⚙️ Quick Setup
Prerequisites

Node.js (v14+)
MongoDB Atlas account
Razorpay account (test mode)

Installation
bash# Clone repository
git clone https://github.com/YOUR_USERNAME/razorpay-mern-payment-gateway.git
cd razorpay-mern-payment-gateway

# Backend setup
- cd backend  
- npm install

# Frontend setup
cd ../frontend
npm install
Environment Variables
Create .env files in both frontend and backend folders:
Backend (.env):
envMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payments
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
PORT=5000
Frontend (.env):
envREACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
REACT_APP_API_BASE_URL=http://localhost:5000

# Running the Application
bash 

# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
cd frontend
npm run dev

Frontend: http://localhost:3000
Backend API: http://localhost:5000

# Key API Endpoints
Create Payment Order
httpPOST /api/create-order
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "phone": "9876543210",
  "amount": 1000,
  "tip": 18
}

Verify Payment
httpPOST /api/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_DEF456", 
  "razorpay_signature": "signature_hash"
}

# Testing
Test Card Details (Razorpay Test Mode):

Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123

Test UPI: success@razorpay

# Live Demo

Application: https://your-app.railway.app
GitHub: Repository Link

# Project Structure
├── frontend/
│   ├── src/components/    # React components
│   ├── src/utils/         # API and validation utilities
│   └── public/            # Static files
├── backend/
│   ├── controllers/       # Payment logic
│   ├── models/           # Database schemas
│   └── server.js         # Express server
└── README.md

# Security Features

Environment variables for sensitive data
Payment signature verification using HMAC SHA256
Input validation and sanitization
CORS configuration for secure API access

# Contact
Developer: Prajesh Parekh
Phone: 7228913748
Email: thisisprajesh11@gmail.com
LinkedIn: https://www.linkedin.com/in/prajesh-parekh-695464130/
