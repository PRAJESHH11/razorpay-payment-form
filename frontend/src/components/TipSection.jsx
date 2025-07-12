import React from 'react'

const TipSection = ({ 
  tipPercentage, 
  setTipPercentage, 
  contributionAmount, 
  totalAmount 
}) => {
  const tipOptions = [0, 5, 10, 18]

  return (
    <div className="mb-4 p-3 tip-section">
      <div className="row align-items-start">
        <div className="col-10">
          <p className="mb-3" style={{ 
            fontSize: '13px', 
            lineHeight: '1.4',
            color: '#2c3e50',
            fontWeight: '500',
            margin: '0'
          }}>
            Ketto is charging 0% platform fee* for this fundraiser, relying solely on the generosity of contributors like you.
          </p>
        </div>
        <div className="col-2 text-end">
          <div className="info-icon mx-auto">
            i
          </div>
        </div>
      </div>
      
      <div className="d-flex align-items-center justify-content-between mb-3 mt-3">
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Support us by adding a tip of :
        </span>
        <select
          className="form-select"
          style={{ 
            width: 'auto',
            minWidth: '140px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '13px',
            padding: '4px 8px',
            color: '#2c3e50',
            fontWeight: '500'
          }}
          value={tipPercentage}
          onChange={(e) => setTipPercentage(parseInt(e.target.value))}
        >
          {tipOptions.map((tip) => (
            <option key={tip} value={tip}>
              {tip}% (INR {Math.round((contributionAmount * tip) / 100)})
            </option>
          ))}
        </select>
      </div>
      
      <div className="text-end">
        <strong style={{ 
          color: '#2c3e50', 
          fontSize: '15px',
          fontWeight: '700'
        }}>
          Total Amount: INR {totalAmount}
        </strong>
      </div>
    </div>
  )
}

export default TipSection