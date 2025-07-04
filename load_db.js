const db = require('./db_connection')
const fs = require('fs')
const path = require('path')

const run = async () => {
  const filePath = path.join(__dirname, 'cmudict-0.7b')

  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf8')

  // each line should be divided by spaces. the first array element is the word, 
  // all the rest (trimmed) is the pronunciation

  // Split file content into lines and filter out empty lines
  const lines = fileContent.split('\n').filter(line => line.trim().length > 0)
  
  console.log(`Found ${lines.length} pronunciation entries to process`)
  
  // Clear existing data
  console.log('Clearing existing pronunciations...')
  await db('pronunciations').del()
  
  // Process lines in batches for better performance
  const batchSize = 100 // Reduced from 1000 to avoid SQL limit
  let processed = 0
  let totalVariants = 0
  let baseWords = 0
  
  for (let i = 0; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize)
    const pronunciationData = []
    
    for (const line of batch) {
      // Skip comment lines that start with ;;;
      if (line.startsWith(';;;')) {
        continue
      }
      
      // Split by spaces - first part is word, rest is pronunciation
      const parts = line.trim().split(/\s+/)
      if (parts.length < 2) {
        continue // Skip malformed lines
      }
      
      const wordVariant = parts[0] // Full word with variant (e.g., "AARONSON(1)")
      const phonetic = parts.slice(1).join(' ')
      
      // Parse word and variant
      let baseWord = wordVariant
      let variantNumber = null
      
      // Check if word has variant notation like (1), (2), etc.
      const variantMatch = wordVariant.match(/^(.+)\((\d+)\)$/)
      if (variantMatch) {
        baseWord = variantMatch[1]
        variantNumber = parseInt(variantMatch[2])
        totalVariants++
      } else {
        baseWords++
      }
      
      pronunciationData.push({
        word: baseWord,
        word_variant: wordVariant,
        variant_number: variantNumber,
        phonetic: phonetic,
        source: 'CMU Pronouncing Dictionary v0.7b'
      })
    }
    
    // Insert batch into database
    if (pronunciationData.length > 0) {
      await db('pronunciations').insert(pronunciationData)
      processed += pronunciationData.length
      console.log(`Processed ${processed} / ${lines.length} entries`)
    }
  }
  
  console.log(`Successfully loaded ${processed} pronunciation entries into the database`)
  console.log(`  - Base pronunciations: ${baseWords}`)
  console.log(`  - Variant pronunciations: ${totalVariants}`)
  console.log(`  - Total entries: ${processed}`)
  
  // Close database connection
  await db.destroy()
}

// Run the script
run()
  .then(() => {
    console.log('Database loading completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error loading database:', error)
    process.exit(1)
  })