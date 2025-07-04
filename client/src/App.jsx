import { useState, useEffect } from 'react'
import Layout from './Layout'
import './styles/index.scss'

function App() {
  const [dbStats, setDbStats] = useState(null)

  // Load database stats on component mount
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setDbStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  return (
    <div className="app">
      <Layout dbStats={dbStats} />
    </div>
  )
}

export default App
