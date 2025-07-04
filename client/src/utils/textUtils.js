/**
 * Utility functions for text processing and manipulation
 */

/**
 * Preserves the case pattern from the original word when replacing with a new word
 * @param {string} originalWord - The original word to match case from
 * @param {string} newWord - The new word to apply case to
 * @param {Array} analyzedWords - Array of analyzed words for context
 * @param {Object} selectedWord - Currently selected word object for context
 * @returns {string} The new word with preserved case pattern
 */
export const preserveCase = (originalWord, newWord, analyzedWords, selectedWord) => {
  if (!originalWord || !newWord) return newWord
  
  // Convert new word to lowercase for manipulation
  const newWordLower = newWord.toLowerCase()
  
  // Special case for "I" - it should become lowercase unless at sentence start
  if (originalWord === "I") {
    // Check if this "I" is at the beginning of the sentence by looking at the analyzed words
    const wordIndex = analyzedWords.findIndex(w => w.text === originalWord && w.id === selectedWord?.id)
    if (wordIndex >= 0) {
      // Look for the first actual word in the sentence (skip punctuation/spaces)
      const firstWordIndex = analyzedWords.findIndex(w => w.isWord)
      // If this "I" is the first word, capitalize the replacement
      if (wordIndex === firstWordIndex) {
        return newWordLower.charAt(0).toUpperCase() + newWordLower.slice(1)
      }
    }
    // Otherwise, keep the replacement lowercase
    return newWordLower
  }
  
  // If original word is all uppercase (but not "I")
  if (originalWord === originalWord.toUpperCase() && originalWord.length > 1) {
    return newWordLower.toUpperCase()
  }
  
  // If original word starts with uppercase (title case)
  if (originalWord[0] === originalWord[0].toUpperCase()) {
    return newWordLower.charAt(0).toUpperCase() + newWordLower.slice(1)
  }
  
  // If original word is all lowercase or mixed case, keep new word lowercase
  return newWordLower
}

/**
 * Extracts words and punctuation from a sentence while preserving structure
 * @param {string} sentence - The sentence to parse
 * @returns {Array} Array of sentence parts (words, spaces, punctuation)
 */
export const parseSentence = (sentence) => {
  return sentence.split(/(\s+|[.,!?;:"])/).filter(part => part.length > 0)
}

/**
 * Extracts only actual words (alphabetic characters) from sentence parts
 * @param {Array} sentenceParts - Array of sentence parts from parseSentence
 * @returns {Array} Array of lowercase words only
 */
export const extractWords = (sentenceParts) => {
  return sentenceParts
    .filter(word => /^[a-zA-Z]+$/.test(word)) // Only actual words
    .map(word => word.toLowerCase())
}

/**
 * Checks if a word part is an actual word (contains only letters)
 * @param {string} part - The part to check
 * @returns {boolean} True if the part is a word
 */
export const isWord = (part) => {
  return /^[a-zA-Z]+$/.test(part)
}

/**
 * Calculates total homophone count from pronunciation data
 * @param {Array} pronunciations - Array of pronunciation objects
 * @returns {number} Total number of homophones
 */
export const getTotalHomophoneCount = (pronunciations) => {
  return pronunciations.reduce((sum, p) => sum + p.homophone_count, 0)
}
