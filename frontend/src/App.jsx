import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import PaymentForm from './components/PaymentForm'
import PaymentSuccess from './components/PaymentSuccess' // Add this import
import AdminDashboard from './components/AdminDashboard'
import BackendTest from './components/BackendTest'

// This component is INSIDE the AuthProvider, so it can use useAuth
function AuthenticatedApp() {
  const { user, logout, loading } = useAuth()
  const [currentView, setCurrentView] = useState('payment')
  const [paymentData, setPaymentData] = useState(null) // Add state for payment data

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <div className="text-center text-white">
          <div className="spinner-border text-light mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading...</h4>
          <p>Checking your login status...</p>
        </div>
      </div>
    )
  }

  // If no user is logged in, show login screen
  if (!user) {
    return <AuthScreen />
  }

  // Function to handle payment success - called from PaymentForm
  const handlePaymentSuccess = (paymentDetails) => {
    console.log('Payment successful, switching to thank you page:', paymentDetails)
    setPaymentData(paymentDetails)
    setCurrentView('payment-success')
  }

  // Function to go back to payment form from success page
  const handleBackToPayment = () => {
    setCurrentView('payment')
    setPaymentData(null)
  }

  // User is logged in, show your existing app structure
  return (
    <div className="App">
      {/* Only show navbar if not on payment success page */}
      {currentView !== 'payment-success' && (
        <nav className="navbar navbar-light bg-light mb-4">
          <div className="container">
            <span className="navbar-brand mb-0 h1 text-primary">Payment Form</span>
            
            <div className="d-flex align-items-center">
              {/* User welcome message */}
              <div className="me-3">
                <span className="text-muted small">Welcome, </span>
                <span className="fw-bold text-primary">{user.fullName}</span>
              </div>
              
              {/* Your existing navigation buttons */}
              <div className="me-3">
                <button
                  className={`btn btn-sm me-2 ${currentView === 'payment' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView('payment')}
                >
                  Payment Form
                </button>
                <button
                  className={`btn btn-sm me-2 ${currentView === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView('admin')}
                >
                  Admin Dashboard
                </button>
                <button
                  className={`btn btn-sm ${currentView === 'test' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentView('test')}
                >
                  Test Backend
                </button>
              </div>
              
              {/* Logout button */}
              <button 
                onClick={logout} 
                className="btn btn-outline-danger btn-sm"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Content rendering with new payment success view */}
      {currentView === 'payment' && (
        <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
      )}
      {currentView === 'payment-success' && (
        <PaymentSuccess 
          paymentData={paymentData} 
          onBackToPayment={handleBackToPayment}
        />
      )}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'test' && (
        <div className="container">
          <BackendTest />
        </div>
      )}
    </div>
  )
}

// Main App component - wraps everything in AuthProvider
function App() {
  return (
    // This AuthProvider wrapper makes useAuth available to all child components
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

export default App