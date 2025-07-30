import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PaymentSuccess = ({ paymentData, onBackToPayment }) => {
  const { user } = useAuth();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCampaign, setCurrentCampaign] = useState(0);

  // Sample campaigns data (replace with AI-generated content later)
  const sampleCampaigns = [
    {
      type: "Child Hunger",
      fact: "Every 10 seconds, a child dies from hunger-related causes worldwide. 48% of underprivileged children face life-threatening malnutrition.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
      title: "Help Feed Hungry Children",
      description: "Provide nutritious meals to children in need"
    },
    {
      type: "Medical Emergency",
      fact: "In India, 55% of medical expenses are paid out-of-pocket, pushing families into poverty during health emergencies.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      title: "Support Medical Treatment",
      description: "Help families afford life-saving medical procedures"
    },
    {
      type: "Animal Welfare",
      fact: "Over 30 million stray animals in India lack basic food and medical care. Your donation can save precious lives.",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
      title: "Care for Stray Animals",
      description: "Provide food, shelter and medical care for abandoned animals"
    },
    {
      type: "Education",
      fact: "6 million children in India are still out of school. Education is the most powerful tool to break the cycle of poverty.",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop",
      title: "Support Education for All",
      description: "Help underprivileged children access quality education"
    }
  ];

  // Fetch AI-generated impact data
  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch AI-generated content from backend
        const response = await fetch('http://localhost:5000/api/generate-impact-content');
        
        if (response.ok) {
          const data = await response.json();
          setImpactData(data);
        } else {
          // Fallback to sample data if AI fails
          setImpactData({
            campaigns: sampleCampaigns
          });
        }
      } catch (error) {
        console.error('Error fetching impact data:', error);
        // Use sample data as fallback
        setImpactData({
          campaigns: sampleCampaigns
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  // Rotate through campaigns every 8 seconds
  useEffect(() => {
    if (impactData && impactData.campaigns) {
      const interval = setInterval(() => {
        setCurrentCampaign(prev => 
          (prev + 1) % impactData.campaigns.length
        );
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [impactData]);

  const handleDonateAgain = () => {
    if (onBackToPayment) {
      onBackToPayment();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-muted">Preparing your impact story...</h4>
        </div>
      </div>
    );
  }

  const campaign = impactData?.campaigns[currentCampaign] || sampleCampaigns[0];

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            
            {/* Success Header */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center py-5">
                {/* Success Animation */}
                <div className="mb-4">
                  <div 
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      backgroundColor: '#28a745',
                      animation: 'successPulse 2s ease-in-out infinite'
                    }}
                  >
                    <svg width="40" height="40" fill="white" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </div>
                </div>

                <h2 className="text-success mb-3" style={{ fontWeight: '600' }}>
                  Thank You {user?.fullName || 'for Your Contribution'}!
                </h2>
                
                <p className="text-muted mb-4" style={{ fontSize: '18px' }}>
                  Your payment was successful. Your generosity makes a real difference!
                </p>

                {paymentData && (
                  <div className="row justify-content-center">
                    <div className="col-md-6">
                      <div className="bg-light rounded p-3">
                        <h6 className="text-muted mb-2">Contribution Details</h6>
                        <p className="h5 text-success mb-0">₹{paymentData.amount || '2,950'}</p>
                        <small className="text-muted">Transaction ID: {paymentData.transactionId || 'TXN123456789'}</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Story Section */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="pe-md-4">
                      <h4 className="text-primary mb-3" style={{ fontWeight: '600' }}>
                        Your Impact in Action
                      </h4>
                      
                      <div className="mb-3">
                        <span className="badge bg-primary mb-2">{campaign.type}</span>
                        <p className="text-muted mb-3" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                          {campaign.fact}
                        </p>
                      </div>

                      <h5 className="mb-2">{campaign.title}</h5>
                      <p className="text-muted mb-4">{campaign.description}</p>

                      <button 
                        className="btn btn-success btn-lg px-4"
                        onClick={handleDonateAgain}
                        style={{ borderRadius: '25px' }}
                      >
                        Donate to This Cause
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="text-center">
                      <img 
                        src={campaign.image} 
                        alt={campaign.title}
                        className="img-fluid rounded shadow"
                        style={{ 
                          maxHeight: '300px',
                          width: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Indicators */}
            <div className="text-center mb-4">
              <div className="d-inline-flex">
                {impactData?.campaigns.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-circle mx-1 ${index === currentCampaign ? 'bg-primary' : 'bg-light'}`}
                    style={{ width: '10px', height: '10px', cursor: 'pointer' }}
                    onClick={() => setCurrentCampaign(index)}
                  />
                ))}
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-center py-5 text-white">
                <h3 className="mb-3" style={{ fontWeight: '600' }}>
                  Keep Making a Difference
                </h3>
                <p className="mb-4" style={{ fontSize: '18px', opacity: '0.9' }}>
                  Together, we can create positive change in more lives.
                </p>
                
                <div className="row justify-content-center">
                  <div className="col-auto">
                    <button 
                      className="btn btn-light btn-lg px-4 me-3"
                      onClick={handleDonateAgain}
                      style={{ borderRadius: '25px', fontWeight: '500' }}
                    >
                      Make Another Donation
                    </button>
                  </div>
                  <div className="col-auto">
                    <button 
                      className="btn btn-outline-light btn-lg px-4"
                      onClick={() => window.open('https://www.facebook.com/sharer/sharer.php', '_blank')}
                      style={{ borderRadius: '25px', fontWeight: '500' }}
                    >
                      Share Your Impact
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes successPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;