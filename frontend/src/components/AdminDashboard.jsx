import React, { useState, useEffect } from 'react'

const AdminDashboard = () => {
  const [contributions, setContributions] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('contributions')

  useEffect(() => {
    fetchContributions()
    fetchStats()
  }, [])

  const fetchContributions = async () => {
    try {
      const response = await fetch('/api/contributions')
      const data = await response.json()
      if (data.success) {
        setContributions(data.contributions)
      }
    } catch (error) {
      console.error('Error fetching contributions:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-primary mb-4">Admin Dashboard</h1>
          
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Contributions</h5>
                  <h3 className="card-text">{stats.totalContributions || 0}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Amount</h5>
                  <h3 className="card-text">{formatCurrency(stats.totalAmount || 0)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Recent Contributions</h5>
                  <h3 className="card-text">{stats.recentContributions?.length || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contributions' ? 'active' : ''}`}
                onClick={() => setActiveTab('contributions')}
              >
                All Contributions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                Recent Contributions
              </button>
            </li>
          </ul>

          {activeTab === 'contributions' && (
            <div className="card">
              <div className="card-header">
                <h5>All Contributions</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Amount</th>
                        <th>Tip</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Anonymous</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map((contribution) => (
                        <tr key={contribution._id}>
                          <td>{formatDate(contribution.createdAt)}</td>
                          <td>{contribution.name}</td>
                          <td>{contribution.email}</td>
                          <td>{contribution.phone}</td>
                          <td>{formatCurrency(contribution.amount)}</td>
                          <td>{contribution.tip}%</td>
                          <td>{formatCurrency(contribution.totalAmount)}</td>
                          <td>
                            <span className={`badge ${
                              contribution.paymentStatus === 'completed' ? 'bg-success' :
                              contribution.paymentStatus === 'failed' ? 'bg-danger' :
                              'bg-warning'
                            }`}>
                              {contribution.paymentStatus}
                            </span>
                          </td>
                          <td>
                            {contribution.anonymous ? '✓' : '✗'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="card">
              <div className="card-header">
                <h5>Recent Contributions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.recentContributions?.map((contribution) => (
                    <div key={contribution._id} className="col-md-6 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="font-weight-bold">
                                {contribution.anonymous ? 'Anonymous' : contribution.name}
                              </h6>
                              <p className="text-muted small mb-1">
                                {formatDate(contribution.createdAt)}
                              </p>
                              <p className="text-success mb-0">
                                {formatCurrency(contribution.totalAmount)}
                              </p>
                            </div>
                            <div className="text-end">
                              {contribution.anonymous && (
                                <span className="badge bg-secondary">Anonymous</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard