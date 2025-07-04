import { useState } from 'react'

function WordSearch() {
  const [searchWord, setSearchWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  const searchHomophones = async () => {
    const word = searchWord.trim()
    if (!word) {
      setError('Please enter a word to search for.')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch(`/api/homophones/${encodeURIComponent(word)}`)
      const data = await response.json()

      setLoading(false)

      if (!data.success) {
        setError(data.message)
        return
      }

      setResults(data)
    } catch (err) {
      setLoading(false)
      setError('An error occurred while searching. Please try again.')
      console.error('Search error:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchHomophones()
    }
  }

  const handleInputChange = (e) => {
    setSearchWord(e.target.value)
    if (error) {
      setError('')
    }
  }

  return (
    <>
      <div className="header">
        <h1>🎵 Homophone Finder</h1>
        <p>Find words that sound the same but are spelled differently</p>
      </div>
      
      <div className="search-box">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Enter a word (e.g., there, to, right)"
          value={searchWord}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          autoComplete="off"
        />
        <button 
          className="search-btn" 
          onClick={searchHomophones}
          disabled={loading}
        >
          Find Homophones
        </button>
      </div>
      
      {loading && (
        <div className="loading">
          🔍 Searching for homophones...
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {results && (
        <div className="results">
          <div className="word-header">
            <h2>Results for "{results.word}"</h2>
            <p>Found {results.pronunciations.length} pronunciation{results.pronunciations.length !== 1 ? 's' : ''}</p>
          </div>
          
          {results.pronunciations.map((pronunciation, index) => {
            const variant = pronunciation.variant_number ? ` (variant ${pronunciation.variant_number})` : ''
            
            return (
              <div key={index} className="pronunciation-section">
                <div className="pronunciation-header">
                  <div className="pronunciation-title">
                    {pronunciation.word_variant}{variant}
                  </div>
                  <div className="phonetic">{pronunciation.phonetic}</div>
                </div>
                
                <div className="homophones-list">
                  <div className="homophones-header">
                    🎯 Homophones ({pronunciation.homophone_count} found):
                  </div>
                  
                  {pronunciation.homophones.length === 0 ? (
                    <div className="no-homophones">
                      No homophones found for this pronunciation.
                    </div>
                  ) : (
                    pronunciation.homophones.map((homophone, hIndex) => (
                      <div key={hIndex} className="homophone-item">
                        <div className="homophone-word">• {homophone.word}</div>
                        {homophone.variants.length > 0 && (
                          <div className="homophone-variants">
                            {homophone.variants.map((variant, vIndex) => {
                              const variantText = variant.variant_number ? 
                                ` (variant ${variant.variant_number})` : ' (base)'
                              return (
                                <div key={vIndex}>
                                  {variant.word_variant}{variantText}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default WordSearch
