import { useState, useEffect } from 'react'
import Navigation from './Navigation'
import WordSearch from './WordSearch'
import SentenceEditor from './SentenceEditor'

function Layout({ dbStats }) {
  const [activeTab, setActiveTab] = useState('search')

  // Read tab from URL query string on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabFromUrl = urlParams.get('tab')
    
    // Validate the tab parameter and set if valid
    if (tabFromUrl === 'search' || tabFromUrl === 'editor') {
      setActiveTab(tabFromUrl)
    }
    
    // Set initial page title
    const titles = {
      search: 'Word Search - Homophone Finder',
      editor: 'Sentence Editor - Homophone Finder'
    }
    const currentTab = (tabFromUrl === 'search' || tabFromUrl === 'editor') ? tabFromUrl : 'search'
    document.title = titles[currentTab]
  }, [])

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    
    // Update URL query string
    const url = new URL(window.location)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
    
    // Update page title
    const titles = {
      search: 'Word Search - Homophone Finder',
      editor: 'Sentence Editor - Homophone Finder'
    }
    document.title = titles[tab] || 'Homophone Finder'
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const tabFromUrl = urlParams.get('tab')
      
      if (tabFromUrl === 'search' || tabFromUrl === 'editor') {
        setActiveTab(tabFromUrl)
      } else {
        setActiveTab('search') // Default fallback
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <WordSearch />
      case 'editor':
        return <SentenceEditor />
      default:
        return <WordSearch />
    }
  }

  return (
    <div className="container">
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {renderContent()}
      
      <div className="stats">
        <p>Powered by the CMU Pronouncing Dictionary</p>
        {dbStats ? (
          <p>
            {dbStats.total_pronunciations.toLocaleString()} pronunciations • {' '}
            {dbStats.base_pronunciations.toLocaleString()} base words • {' '}
            {dbStats.variant_pronunciations.toLocaleString()} variants
          </p>
        ) : (
          <p>Loading database statistics...</p>
        )}
      </div>
    </div>
  )
}

export default Layout
