import { useState, useEffect, useCallback } from 'react'
import { preserveCase, parseSentence, extractWords, isWord, getTotalHomophoneCount } from './utils/textUtils'
import { fetchBatchHomophones, fetchSingleWordHomophones, createHomophoneMap } from './utils/apiUtils'

function SentenceEditor() {
  const [sentence, setSentence] = useState('')
  const [analyzedWords, setAnalyzedWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [homophones, setHomophones] = useState([])
  const [isReplacingWord, setIsReplacingWord] = useState(false)

  // Analyze sentence for words with homophones
  const analyzeSentence = async () => {
    if (!sentence.trim()) {
      setAnalyzedWords([])
      return
    }

    setLoading(true)
    
    // Extract words from sentence (preserve punctuation and spacing)
    const words = parseSentence(sentence)
    const wordList = extractWords(words)

    try {
      // Use batch API to check all words at once
      const data = await fetchBatchHomophones(wordList)
      
      if (data.success) {
        // Create a map of words that have homophones
        const homophoneMap = createHomophoneMap(data.results)

        // Analyze each part of the sentence
        const analyzed = words.map((part, index) => {
          const cleanWord = part.toLowerCase()
          const hasHomophones = homophoneMap.has(cleanWord)
          
          return {
            id: index,
            text: part,
            isWord: isWord(part),
            hasHomophones,
            homophoneData: hasHomophones ? homophoneMap.get(cleanWord) : null
          }
        })

        setAnalyzedWords(analyzed)
      }
    } catch (error) {
      console.error('Error analyzing sentence:', error)
    }
    
    setLoading(false)
  }

  // Handle word click
  const handleWordClick = (wordData) => {
    if (!wordData.hasHomophones) return
    
    setSelectedWord(wordData)
    setHomophones(wordData.homophoneData.pronunciations)
  }

  // Replace word in sentence
  const replaceWord = async (originalWordData, newWord) => {
    setIsReplacingWord(true) // Flag to prevent re-analysis
    
    // Preserve the case of the original word
    const preservedCaseWord = preserveCase(originalWordData.text, newWord, analyzedWords, selectedWord)
    
    // Check if the new word has homophones
    let newWordHomophoneData = null
    try {
      const data = await fetchSingleWordHomophones(newWord)
      
      if (data.success) {
        const totalHomophones = getTotalHomophoneCount(data.pronunciations)
        if (totalHomophones > 0) {
          newWordHomophoneData = data
        }
      }
    } catch (error) {
      console.error('Error checking homophones for new word:', error)
    }
    
    // Update the analyzed words with the replacement
    const newAnalyzedWords = analyzedWords.map(word => {
      if (word.id === originalWordData.id) {
        return { 
          ...word, 
          text: preservedCaseWord,
          hasHomophones: newWordHomophoneData !== null,
          homophoneData: newWordHomophoneData
        }
      }
      return word
    })
    
    setAnalyzedWords(newAnalyzedWords)
    
    // Update sentence without triggering re-analysis
    const newSentence = newAnalyzedWords.map(w => w.text).join('')
    setSentence(newSentence)
    
    setSelectedWord(null)
    setHomophones([])
    
    // Reset flag after a short delay
    setTimeout(() => setIsReplacingWord(false), 100)
  }

  // Auto-analyze when sentence changes (with debounce) - but skip if just replacing words
  useEffect(() => {
    // Skip analysis if we're just replacing a word
    if (isReplacingWord) {
      return
    }
    
    const timeoutId = setTimeout(() => {
      analyzeSentence()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [sentence, isReplacingWord])

  return (
    <div className="sentence-editor">
      <div className="header">
        <h1>✏️ Sentence Homophone Editor</h1>
        <p>Type a sentence and click on highlighted words to replace them with homophones</p>
      </div>

      <div className="input-section">
        <label htmlFor="sentence-input" className="form-label">
          Enter your sentence:
        </label>
        <textarea
          id="sentence-input"
          className="sentence-input"
          placeholder="Type a sentence here... (e.g., 'I can see the blue sea')"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          rows={3}
        />
      </div>

      {analyzedWords.length > 0 && (
        <div className="analyzed-section">
          <h3>
            Interactive Text:
            {loading && (
              <span className="loading-inline">
                🔍 Analyzing...
              </span>
            )}
          </h3>
          <div className="analyzed-text">
            {analyzedWords.map((word) => (
              <span
                key={word.id}
                className={`word-part ${
                  word.hasHomophones ? 'has-homophones' : ''
                } ${word.isWord ? 'is-word' : ''}`}
                onClick={() => handleWordClick(word)}
                title={word.hasHomophones ? 'Click to see homophone options' : ''}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && analyzedWords.length === 0 && (
        <div className="loading">
          🔍 Analyzing sentence for homophones...
        </div>
      )}

      {selectedWord && homophones.length > 0 && (
        <div className="homophone-selector">
          <h4>Replace "{selectedWord.text}" with:</h4>
          <div className="homophone-options">
            {homophones.map((pronunciation, pIndex) => (
              <div key={pIndex} className="pronunciation-group">
                <div className="pronunciation-info">
                  <span className="phonetic">{pronunciation.phonetic}</span>
                  {pronunciation.variant_number && (
                    <span className="variant"> (variant {pronunciation.variant_number})</span>
                  )}
                </div>
                <div className="homophone-buttons">
                  {pronunciation.homophones.map((homophone, hIndex) => {
                    const preservedCasePreview = preserveCase(selectedWord.text, homophone.word, analyzedWords, selectedWord)
                    return (
                      <button
                        key={hIndex}
                        className="homophone-btn"
                        onClick={() => replaceWord(selectedWord, homophone.word)}
                        title={`Replace "${selectedWord.text}" with "${preservedCasePreview}"`}
                      >
                        {preservedCasePreview}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="close-btn"
            onClick={() => setSelectedWord(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="instructions">
        <h4>How to use:</h4>
        <ul>
          <li>📝 Type or paste a sentence in the text area above</li>
          <li>🔍 Words with homophones will be <span className="highlight-example">highlighted</span></li>
          <li>👆 Click on any highlighted word to see homophone options</li>
          <li>🔄 Click on a homophone to replace the original word</li>
        </ul>
      </div>
    </div>
  )
}

export default SentenceEditor
