const express = require('express')
const db = require('./db_connection')
const path = require('path')
const { findHomophonesOptimized } = require('./homophone_functions')

const app = express()
const PORT = process.env.PORT || 11001

// Middleware
app.use(express.json())
app.use(express.static('public'))

// Use the optimized homophone function
const findHomophones = findHomophonesOptimized

// API endpoint to find homophones
app.get('/api/homophones/:word', async (req, res) => {
  const { word } = req.params
  
  if (!word || word.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please provide a word to search for.'
    })
  }
  
  const result = await findHomophones(word)
  res.json(result)
})

// Batch API endpoint to find homophones for multiple words
app.post('/api/homophones/batch', async (req, res) => {
  const { words } = req.body
  
  // Validate input
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of words to search for.',
      example: { words: ['there', 'to', 'right'] }
    })
  }
  
  // Limit batch size to prevent abuse
  const MAX_BATCH_SIZE = 50
  if (words.length > MAX_BATCH_SIZE) {
    return res.status(400).json({
      success: false,
      message: `Maximum batch size is ${MAX_BATCH_SIZE} words. You provided ${words.length}.`
    })
  }
  
  // Validate each word
  const validWords = []
  const invalidWords = []
  
  words.forEach((word, index) => {
    if (typeof word === 'string' && word.trim().length > 0) {
      validWords.push(word.trim())
    } else {
      invalidWords.push({ index, value: word, reason: 'Invalid word format' })
    }
  })
  
  if (validWords.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid words provided.',
      invalid_words: invalidWords
    })
  }
  
  try {
    const results = {
      success: true,
      total_words: words.length,
      valid_words: validWords.length,
      invalid_words: invalidWords.length,
      results: [],
      errors: invalidWords
    }
    
    // Process each word
    const startTime = Date.now()
    for (const word of validWords) {
      const result = await findHomophones(word)
      results.results.push(result)
    }
    const endTime = Date.now()
    
    results.processing_time_ms = endTime - startTime
    results.summary = {
      found: results.results.filter(r => r.success).length,
      not_found: results.results.filter(r => !r.success).length,
      total_homophones: results.results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.pronunciations.reduce((pSum, p) => pSum + p.homophone_count, 0), 0)
    }
    
    res.json(results)
  } catch (error) {
    console.error('Error in batch homophone search:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the batch request.',
      error: error.message
    })
  }
})

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.raw('SELECT 1')
    res.json({ 
      success: true, 
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message
    })
  }
})

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const totalCount = await db('pronunciations').count('id as count').first()
    const baseWordsCount = await db('pronunciations')
      .whereNull('variant_number')
      .count('id as count')
      .first()
    const variantsCount = await db('pronunciations')
      .whereNotNull('variant_number')
      .count('id as count')
      .first()
    
    res.json({
      success: true,
      stats: {
        total_pronunciations: parseInt(totalCount.count),
        base_pronunciations: parseInt(baseWordsCount.count),
        variant_pronunciations: parseInt(variantsCount.count)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving database stats',
      error: error.message
    })
  }
})

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Homophone Finder Web Server running on http://localhost:${PORT}`)
  console.log(`📖 API endpoints:`)
  console.log(`   GET /api/homophones/:word - Find homophones for a word`)
  console.log(`   POST /api/homophones/batch - Find homophones for multiple words`)
  console.log(`   GET /api/health - Server health check`)
  console.log(`   GET /api/stats - Database statistics`)
  console.log(`   GET / - Web interface`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  await db.destroy()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...')
  await db.destroy()
  process.exit(0)
})
