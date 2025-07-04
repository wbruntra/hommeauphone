/**
 * API utility functions for homophone operations
 */

/**
 * Fetches homophones for multiple words using the batch API
 * @param {Array} words - Array of words to check for homophones
 * @returns {Promise<Object>} API response with homophone data
 */
export const fetchBatchHomophones = async (words) => {
  const response = await fetch('/api/homophones/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ words })
  })
  
  return await response.json()
}

/**
 * Fetches homophones for a single word
 * @param {string} word - The word to check for homophones
 * @returns {Promise<Object>} API response with homophone data
 */
export const fetchSingleWordHomophones = async (word) => {
  const response = await fetch(`/api/homophones/${encodeURIComponent(word.toLowerCase())}`)
  return await response.json()
}

/**
 * Creates a map of words that have homophones from batch API results
 * @param {Array} results - Results array from batch API response
 * @returns {Map} Map with lowercase words as keys and homophone data as values
 */
export const createHomophoneMap = (results) => {
  const homophoneMap = new Map()
  
  results.forEach(result => {
    if (result.success) {
      const totalHomophones = result.pronunciations.reduce(
        (sum, p) => sum + p.homophone_count, 0
      )
      if (totalHomophones > 0) {
        homophoneMap.set(result.word.toLowerCase(), result)
      }
    }
  })
  
  return homophoneMap
}
