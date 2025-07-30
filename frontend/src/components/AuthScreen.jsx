import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthScreen() {
  const { register, login, error, loading, clearError } = useAuth();
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for switching between login and register
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State for Google loading
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Load Google Script on component mount
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        console.log('✅ Google script already loaded');
        return;
      }

      console.log('📦 Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Identity Services script loaded successfully');
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) clearError();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLoginMode) {
        console.log('Attempting login with:', { email: formData.email });
        await login(formData.email, formData.password);
        console.log('Login successful!');
      } else {
        console.log('Form data before validation:', formData);
        
        // Frontend validation
        if (!formData.fullName?.trim()) {
          alert('Please enter your full name');
          return;
        }
        
        if (!formData.email?.trim()) {
          alert('Please enter your email');
          return;
        }
        
        if (!formData.password) {
          alert('Please enter a password');
          return;
        }
        
        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        
        // Prepare registration data
        const registrationData = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };
        
        console.log('Attempting registration with:', registrationData);
        await register(registrationData);
        console.log('Registration successful!');
      }
      
    } catch (error) {
      console.error('Auth error details:', error);
    }
  };

  // *** IMPROVED GOOGLE OAUTH INTEGRATION ***
  const handleGoogleAuth = async () => {
    // Check if Google script is loaded
    if (!window.google) {
      alert('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    // Check if Google Client ID is configured
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      alert('Google Sign-In is not configured. Please contact support.');
      console.error('❌ VITE_GOOGLE_CLIENT_ID not found in environment variables');
      return;
    }

    setGoogleLoading(true);
    console.log('🚀 Starting Google Sign-In...');
    
    try {
      // Initialize Google Sign-In with improved configuration
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false // Disable FedCM to avoid conflicts
      });

      // Try to show the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('⚠️ Google prompt not displayed, trying alternative method...');
          
          // Fallback: Use popup method
          try {
            window.google.accounts.id.renderButton(
              document.getElementById('temp-google-button'),
              {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'continue_with',
                shape: 'rectangular',
                width: 350
              }
            );
            
            // Auto-click the rendered button
            setTimeout(() => {
              const googleBtn = document.querySelector('#temp-google-button div[role="button"]');
              if (googleBtn) {
                googleBtn.click();
              }
            }, 100);
            
          } catch (renderError) {
            console.error('❌ Failed to render Google button:', renderError);
            setGoogleLoading(false);
            alert('Unable to start Google Sign-In. Please try again or use email login.');
          }
        }
      });

    } catch (error) {
      console.error('❌ Google auth initialization error:', error);
      setGoogleLoading(false);
      alert('Google Sign-In failed to initialize. Please try again.');
    }
  };

  // *** IMPROVED GOOGLE RESPONSE HANDLER ***
  const handleGoogleResponse = async (response) => {
    try {
      console.log('📥 Received Google response');
      setGoogleLoading(false);
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('🔄 Sending to backend...');
      
      // Call your backend Google auth endpoint
      const result = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: response.credential
        })
      });

      const data = await result.json();
      
      if (data.success) {
        console.log('✅ Google auth successful!');
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Use your existing auth context to update user state
        if (window.location) {
          window.location.reload(); // Trigger app state refresh
        }
        
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      setGoogleLoading(false);
      
      // More user-friendly error messages
      let errorMessage = 'Google Sign-In failed. ';
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('popup')) {
        errorMessage += 'Please allow popups for this site and try again.';
      } else {
        errorMessage += 'Please try again or use email login.';
      }
      
      alert(errorMessage);
    }
  };

  // Switch between login and register modes
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    clearError();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        
        {/* Header with Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #1ba89a, #159488)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 8px 25px rgba(27, 168, 154, 0.3)'
          }}>
            {isLoginMode ? '👋' : '🎉'}
          </div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 10px 0'
          }}>
            {isLoginMode ? 'Welcome Back!' : 'Join Our Mission!'}
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {isLoginMode 
              ? 'Sign in to make a contribution and help others' 
              : 'Create an account to start making a difference'
            }
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            background: 'white',
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '28px',
            transition: 'all 0.2s ease',
            opacity: (loading || googleLoading) ? 0.6 : 1
          }}
          onMouseOver={(e) => {
            if (!loading && !googleLoading) {
              e.target.style.borderColor = '#1ba89a';
              e.target.style.background = '#f9fafb';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && !googleLoading) {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = 'white';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {googleLoading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #1ba89a',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Connecting to Google...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Hidden div for Google button rendering */}
        <div id="temp-google-button" style={{ display: 'none' }}></div>

        {/* Elegant Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '28px 0',
          gap: '16px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name - only show in register mode */}
          {!isLoginMode && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                minLength="2"
                maxLength="50"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1ba89a';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(27, 168, 154, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#f9fafb',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1ba89a';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(27, 168, 154, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: !isLoginMode ? '24px' : '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '14px 50px 14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1ba89a';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(27, 168, 154, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#6b7280',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#1ba89a'}
                onMouseOut={(e) => e.target.style.color = '#6b7280'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password - only show in register mode */}
          {!isLoginMode && (
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: '#f9fafb',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1ba89a';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(27, 168, 154, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    color: '#6b7280',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#1ba89a'}
                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || googleLoading) ? '#9ca3af' : 'linear-gradient(135deg, #1ba89a, #159488)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '28px',
              boxShadow: (loading || googleLoading) ? 'none' : '0 4px 12px rgba(27, 168, 154, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading && !googleLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(27, 168, 154, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && !googleLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(27, 168, 154, 0.3)';
              }
            }}
          >
            {loading 
              ? 'Please wait...' 
              : (isLoginMode ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        {/* Toggle between login and register */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            {isLoginMode 
              ? "Don't have an account?" 
              : "Already have an account?"
            }
          </p>
          <button 
            type="button" 
            onClick={toggleMode}
            disabled={loading || googleLoading}
            style={{
              background: 'none',
              border: 'none',
              color: '#1ba89a',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              opacity: (loading || googleLoading) ? 0.6 : 1,
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading && !googleLoading) e.target.style.color = '#159488';
            }}
            onMouseOut={(e) => {
              if (!loading && !googleLoading) e.target.style.color = '#1ba89a';
            }}
          >
            {isLoginMode ? 'Create account here' : 'Sign in here'}
          </button>
        </div>

        {/* CSS for spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default AuthScreen;