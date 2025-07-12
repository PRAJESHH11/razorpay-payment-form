import React from 'react'

const AmountSelector = ({ 
  selectedAmount, 
  setSelectedAmount, 
  customAmount, 
  setCustomAmount, 
  errors 
}) => {
  const amounts = [1000, 2500, 4000]

  return (
    <div className="text-center mb-4">
      <div className="d-flex justify-content-center mb-3" style={{ gap: '20px' }}>
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount)
              setCustomAmount('')
            }}
            className="btn btn-pill price-btn"
            style={{
              backgroundColor: selectedAmount === amount ? '#1ba89a' : 'white',
              color: selectedAmount === amount ? 'white' : '#666',
              border: '1px solid #ddd',
              fontWeight: '400',
              padding: '8px 18px',
              fontSize: '14px',
              minWidth: '70px',
              margin: '0 5px'
            }}
          >
            ₹ {amount}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setSelectedAmount('other')}
        className="btn btn-pill price-btn"
        style={{
          backgroundColor: selectedAmount === 'other' ? '#1ba89a' : 'white',
          color: selectedAmount === 'other' ? 'white' : '#666',
          border: '1px solid #ddd',
          fontWeight: '400',
          padding: '8px 16px',
          fontSize: '14px',
          minWidth: '110px'
        }}
      >
        Other Amount
      </button>

      {selectedAmount === 'other' && (
        <div className="mt-3">
          <input
            type="number"
            placeholder="Enter amount (min ₹100)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
            style={{ 
              border: errors.amount ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '14px'
            }}
            min="100"
            max="500000"
          />
          {errors.amount && (
            <div className="error-message">
              {errors.amount}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AmountSelector