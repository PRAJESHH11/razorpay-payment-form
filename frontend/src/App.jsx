import React, { useState } from 'react'
import PaymentForm from './components/PaymentForm'
import AdminDashboard from './components/AdminDashboard'
import BackendTest from './components/BackendTest'

function App() {
  const [currentView, setCurrentView] = useState('payment')

  return (
    <div className="App">
      <nav className="navbar navbar-light bg-light mb-4">
        <div className="container">
          <span className="navbar-brand mb-0 h1 text-primary">Payment Form</span>
          <div>
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
        </div>
      </nav>

      {currentView === 'payment' && <PaymentForm />}
      {currentView === 'admin' && <AdminDashboard />}
      {currentView === 'test' && (
        <div className="container">
          <BackendTest />
        </div>
      )}
    </div>
  )
}

export default App