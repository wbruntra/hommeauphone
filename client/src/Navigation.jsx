function Navigation({ activeTab, onTabChange }) {
  return (
    <div className="nav-tabs">
      <button 
        className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        🔍 Word Search
      </button>
      <button 
        className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`}
        onClick={() => onTabChange('editor')}
      >
        ✏️ Sentence Editor
      </button>
    </div>
  )
}

export default Navigation
