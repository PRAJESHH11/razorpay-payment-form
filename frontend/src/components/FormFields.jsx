import React, { useState } from 'react'

// ADDED: Accept new props for authentication handling
const FormFields = ({ formData, handleInputChange, errors, user, isAuthenticated }) => {
  const [selectedCountry, setSelectedCountry] = useState('IN')

  // ADDED: Determine if fields should be readonly based on authentication and anonymous status
  // When user is authenticated and not anonymous, name and email are pre-filled and readonly
  const isNameReadonly = isAuthenticated && !formData.anonymous && user
  const isEmailReadonly = isAuthenticated && !formData.anonymous && user

  const countries = [
    { code: 'IN', name: '🇮🇳 India' },
    { code: 'US', name: '🇺🇸 United States' },
    { code: 'GB', name: '🇬🇧 United Kingdom' },
    { code: 'CA', name: '🇨🇦 Canada' },
    { code: 'AU', name: '🇦🇺 Australia' },
    { code: 'AE', name: '🇦🇪 UAE' },
    { code: 'SG', name: '🇸🇬 Singapore' },
    { code: 'DE', name: '🇩🇪 Germany' },
    { code: 'FR', name: '🇫🇷 France' },
    { code: 'JP', name: '🇯🇵 Japan' }
  ]

  return (
    <>
      <div className="mb-3">
        <label className="form-label mb-1" style={{ color: '#dc3545', fontWeight: '600', fontSize: '14px' }}>
          Name *
          {/* ADDED: Show lock icon when field is readonly */}
          {isNameReadonly && (
            <span className="ms-2" title="Pre-filled from your account">
              <svg width="12" height="12" fill="#28a745" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            </span>
          )}
        </label>
        <div className="position-relative">
          <input
            type="text"
            className={`form-control pe-5 ${errors.name ? 'is-invalid' : ''} ${isNameReadonly ? 'readonly-field' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            readOnly={isNameReadonly} // ADDED: Make field readonly when user is authenticated
            style={{ 
              border: errors.name ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 35px 10px 12px',
              fontSize: '14px',
              width: '100%',
              color: '#2c3e50',
              fontWeight: '500',
              backgroundColor: isNameReadonly ? '#f8f9fa' : 'white', // ADDED: Gray background for readonly
              cursor: isNameReadonly ? 'not-allowed' : 'text' // ADDED: Change cursor for readonly
            }}
            placeholder={isNameReadonly ? 'Pre-filled from your account' : 'Enter your full name'}
            title={isNameReadonly ? 'This field is pre-filled from your logged-in account' : ''} // ADDED: Tooltip for readonly
          />
          <div className="icon-right">
            <svg width="16" height="16" fill={isNameReadonly ? "#28a745" : "#dc3545"} viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
          </div>
        </div>
        {errors.name && (
          <div className="error-message">
            {errors.name}
          </div>
        )}
        {/* ADDED: Show helpful text when field is pre-filled */}
        {isNameReadonly && (
          <div className="mt-1">
            <small className="text-success" style={{ fontSize: '12px' }}>
              <i className="fas fa-check-circle me-1"></i>
              Pre-filled from your account
            </small>
          </div>
        )}
        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={formData.anonymous}
            onChange={(e) => handleInputChange('anonymous', e.target.checked)}
          />
          <label className="form-check-label" style={{ fontSize: '13px', color: '#2c3e50', fontWeight: '500' }}>
            Make my contribution anonymous
            {/* ADDED: Show explanation for authenticated users */}
            {isAuthenticated && (
              <span className="text-muted ms-1">
                (will hide your account details)
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label mb-1" style={{ color: '#dc3545', fontWeight: '600', fontSize: '14px' }}>
          Email ID *
          {/* ADDED: Show lock icon when field is readonly */}
          {isEmailReadonly && (
            <span className="ms-2" title="Pre-filled from your account">
              <svg width="12" height="12" fill="#28a745" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            </span>
          )}
        </label>
        <div className="position-relative">
          <input
            type="email"
            className={`form-control pe-5 ${errors.email ? 'is-invalid' : ''} ${isEmailReadonly ? 'readonly-field' : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            readOnly={isEmailReadonly} // ADDED: Make field readonly when user is authenticated
            style={{ 
              border: errors.email ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 35px 10px 12px',
              fontSize: '14px',
              width: '100%',
              color: '#2c3e50',
              fontWeight: '500',
              backgroundColor: isEmailReadonly ? '#f8f9fa' : 'white', // ADDED: Gray background for readonly
              cursor: isEmailReadonly ? 'not-allowed' : 'text' // ADDED: Change cursor for readonly
            }}
            placeholder={isEmailReadonly ? 'Pre-filled from your account' : 'Enter your email address'}
            title={isEmailReadonly ? 'This field is pre-filled from your logged-in account' : ''} // ADDED: Tooltip for readonly
          />
          <div className="icon-right">
            <svg width="16" height="16" fill={isEmailReadonly ? "#28a745" : "#dc3545"} viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
          </div>
        </div>
        {errors.email && (
          <div className="error-message">
            {errors.email}
          </div>
        )}
        {/* ADDED: Show helpful text when field is pre-filled */}
        {isEmailReadonly && (
          <div className="mt-1">
            <small className="text-success" style={{ fontSize: '12px' }}>
              <i className="fas fa-check-circle me-1"></i>
              Pre-filled from your account
            </small>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label mb-1 d-flex align-items-center" style={{ color: '#dc3545', fontWeight: '600', fontSize: '14px' }}>
          Your Mobile Number *
          <span style={{ marginLeft: '5px', fontSize: '16px' }}>📱</span>
        </label>
        <div className="input-group">
          <select
            className="form-select"
            style={{ 
              maxWidth: '100px',
              border: errors.phone ? '1px solid #dc3545' : '1px solid #ddd',
              borderRight: errors.phone ? '1px solid #dc3545' : 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: '13px',
              padding: '10px 8px',
              backgroundColor: '#f8f9fa',
              color: '#2c3e50',
              fontWeight: '500'
            }}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code} ▼
              </option>
            ))}
          </select>
          <input
            type="tel"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Please enter a valid number"
            style={{ 
              border: errors.phone ? '1px solid #dc3545' : '1px solid #ddd',
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
              padding: '10px 12px',
              fontSize: '14px',
              color: '#2c3e50',
              fontWeight: '500'
            }}
          />
        </div>
        {errors.phone && (
          <div className="error-message">
            {errors.phone}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="form-label mb-1" style={{ color: '#6c757d', fontWeight: '600', fontSize: '14px' }}>
          Address *
        </label>
        <div className="position-relative">
          <textarea
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
            rows="3"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            style={{ 
              border: errors.address ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 35px 10px 12px',
              fontSize: '14px',
              resize: 'none',
              width: '100%',
              color: '#2c3e50',
              fontWeight: '500'
            }}
            placeholder="Enter your complete address"
          ></textarea>
          <div className="position-absolute" style={{ right: '10px', top: '12px' }}>
            <svg width="16" height="16" fill="#6c757d" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
          </div>
        </div>
        {errors.address && (
          <div className="error-message">
            {errors.address}
          </div>
        )}
      </div>

      {/* ADDED: Add CSS styles for readonly fields */}
      <style jsx="true">{`
        .readonly-field {
          background-color: #f8f9fa !important;
          cursor: not-allowed !important;
          opacity: 0.8;
        }
        
        .readonly-field:focus {
          box-shadow: none !important;
          border-color: #ced4da !important;
        }
        
        .icon-right {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </>
  )
}

export default FormFields