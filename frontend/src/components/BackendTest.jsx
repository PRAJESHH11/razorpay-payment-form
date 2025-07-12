import React, { useState } from 'react'

const BackendTest = () => {
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testBackend = async () => {
    setIsLoading(true)
    setTestResult('Testing...')
    
    try {
      // Test health endpoint
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Backend Connected!\nResponse: ${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`❌ Backend Error: ${response.status}`)
      }
    } catch (error) {
      setTestResult(`❌ Connection Failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5>Backend Connection Test</h5>
        <button 
          className="btn btn-primary" 
          onClick={testBackend}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        {testResult && (
          <pre className="mt-3 p-2 bg-light rounded" style={{ fontSize: '12px' }}>
            {testResult}
          </pre>
        )}
      </div>
    </div>
  )
}

export default BackendTest