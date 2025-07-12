import React, { useState } from 'react'

const FormFields = ({ formData, handleInputChange, errors }) => {
  const [selectedCountry, setSelectedCountry] = useState('IN')

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
        </label>
        <div className="position-relative">
          <input
            type="text"
            className={`form-control pe-5 ${errors.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            style={{ 
              border: errors.name ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 35px 10px 12px',
              fontSize: '14px',
              width: '100%',
              color: '#2c3e50',
              fontWeight: '500'
            }}
            placeholder="Enter your full name"
          />
          <div className="icon-right">
            <svg width="16" height="16" fill="#dc3545" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
          </div>
        </div>
        {errors.name && (
          <div className="error-message">
            {errors.name}
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
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label mb-1" style={{ color: '#dc3545', fontWeight: '600', fontSize: '14px' }}>
          Email ID *
        </label>
        <div className="position-relative">
          <input
            type="email"
            className={`form-control pe-5 ${errors.email ? 'is-invalid' : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={{ 
              border: errors.email ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 35px 10px 12px',
              fontSize: '14px',
              width: '100%',
              color: '#2c3e50',
              fontWeight: '500'
            }}
            placeholder="Enter your email address"
          />
          <div className="icon-right">
            <svg width="16" height="16" fill="#dc3545" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
          </div>
        </div>
        {errors.email && (
          <div className="error-message">
            {errors.email}
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
    </>
  )
}

export default FormFields