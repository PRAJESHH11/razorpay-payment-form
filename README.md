#  MERN Stack Crowdfunding Platform

A full-stack crowdfunding donation platform with secure authentication, payment processing, and AI-powered social impact content. Built using the MERN stack with modern development practices.

##  Features

###  Authentication System
- **Email/Password Registration & Login**
- **JWT Token-based Authentication**
- **Google OAuth Integration** (In Progress)
- **Persistent Login Sessions**
- **Secure Route Protection**

###  Payment Processing
- **Razorpay Payment Gateway Integration**
- **Multiple Donation Amount Options**
- **Tip Functionality for Platform Support**
- **Secure Payment Verification**
- **Real-time Payment Status Updates**

###  AI-Powered Content
- **OpenAI API Integration**
- **Dynamic Social Impact Facts Generation**
- **Rotating Campaign Content**
- **Fallback System for Reliability**

###  User Experience
- **Responsive Bootstrap Design**
- **Professional Thank You Page**
- **User Data Pre-filling**
- **Loading States & Error Handling**
- **Anonymous Donation Options**

##  Tech Stack

**Frontend:**
- React 19.1.0
- Vite (Build Tool)
- Bootstrap 5.3.7
- Axios for API calls
- Context API for State Management

**Backend:**
- Node.js with Express.js
- MongoDB Atlas (Cloud Database)
- Mongoose ODM
- JSON Web Tokens (JWT)
- Razorpay SDK
- OpenAI API
- Google OAuth Library

**Development Tools:**
- ESLint for Code Quality
- CORS for Cross-Origin Requests
- dotenv for Environment Variables

##  Quick Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account
- Razorpay Account (Test Mode)
- OpenAI Account (Optional)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/mern-crowdfunding-platform.git
cd mern-crowdfunding-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crowdfunding

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# AI Content (Optional)
OPENAI_API_KEY=sk-your_openai_key_here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

##  Getting API Keys

### Razorpay Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings → API Keys**
3. Generate **Test Keys** for development
4. Copy **Key ID** and **Key Secret**

**Test Card Details:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

### OpenAI Setup (Optional)
1. Create account at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys** section
3. Create new secret key
4. Add $5-10 credits for testing

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**
5. Add authorized origins: `http://localhost:3000`

##  Application Flow

```
1. User Registration/Login → 2. Authentication Verification → 3. Payment Form
                ↓
4. Razorpay Checkout → 5. Payment Verification → 6. AI-Powered Thank You Page
```

##  Key Components

### Authentication System
- **AuthContext**: Centralized authentication state management
- **AuthScreen**: Login/Registration interface
- **Protected Routes**: Secure access control

### Payment Processing
- **PaymentForm**: Main donation interface with amount selection
- **AmountSelector**: Predefined and custom amount options
- **TipSection**: Platform tip functionality
- **FormFields**: User information collection

### Post-Payment Experience
- **PaymentSuccess**: AI-powered thank you page
- **Impact Content**: Dynamic social impact facts
- **Campaign Suggestions**: Encourage repeat donations

##  Security Features

- **JWT Token Authentication**
- **Password Encryption** (bcryptjs)
- **Payment Signature Verification**
- **CORS Protection**
- **Input Validation & Sanitization**
- **Environment Variable Protection**

##  Error Handling

- **Graceful API Failure Handling**
- **Network Connectivity Checks**
- **Payment Gateway Error Recovery**
- **User-Friendly Error Messages**
- **Automatic Fallback Systems**

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google` - Google OAuth

### Payments
- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment signature

### Content
- `GET /api/generate-impact-content` - AI-generated social impact content
- `GET /api/health` - Server health check

##  Testing

### Manual Testing Checklist
- [ ] User Registration & Login
- [ ] Payment Flow with Test Cards
- [ ] Form Validation
- [ ] Error Handling
- [ ] Responsive Design
- [ ] Cross-browser Compatibility

### Test Payment Cards
```
Success: 4111 1111 1111 1111
Failed: 4000 0000 0000 0002
```

## Development Notes

### Project Structure
```
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── utils/          # Helper functions
│   │   └── assets/         # Static files
│   └── public/
├── backend/
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── middleware/         # Custom middleware
│   └── config/             # Configuration files
└── README.md
```

### Key Design Decisions
- **Context API** over Redux for simpler state management
- **MongoDB Atlas** for cloud database reliability
- **JWT tokens** for stateless authentication
- **Component composition** for reusable UI elements
- **Environment-based configuration** for deployment flexibility

##  Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel/Netlify
- Update environment variables

### Backend Deployment
- Deploy to Railway/Heroku
- Set production environment variables
- Ensure MongoDB Atlas whitelist includes deployment IP

##  Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  License

This project is licensed under the MIT License. Feel free to use, modify, and distribute.

## Acknowledgments

- **Razorpay** for payment gateway services
- **OpenAI** for AI content generation
- **MongoDB Atlas** for cloud database hosting
- **Unsplash** for placeholder images
- **Bootstrap** for responsive design framework

##  Support

For support or questions:
- Create an issue in this repository
- Email: thisisprajesh11@gmail.com

---

**Built with MERN Stack**

*This project demonstrates modern full-stack development practices including authentication, payment processing, AI integration, and responsive design.*
