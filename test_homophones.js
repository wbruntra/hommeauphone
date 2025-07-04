const db = require('./db_connection')

// Test function to demonstrate homophone finding
const testHomophones = async () => {
  console.log('🎵 Testing Homophone Finder with sample words\n')
  
  const testWords = ['there', 'to', 'right', 'see', 'break']
  
  for (const word of testWords) {
    console.log('═'.repeat(60))
    console.log(`Testing word: "${word.toUpperCase()}"`)
    console.log('═'.repeat(60))
    
    try {
      const normalizedWord = word.toUpperCase()
      
      // Find pronunciations for the word
      const pronunciations = await db('pronunciations')
        .select('phonetic', 'word_variant', 'variant_number')
        .where('word', normalizedWord)
        .orderBy('variant_number')
      
      if (pronunciations.length === 0) {
        console.log(`❌ Word "${word}" not found.`)
        continue
      }
      
      console.log(`🔍 Pronunciations for "${word}":`)
      pronunciations.forEach((p, index) => {
        const variant = p.variant_number ? ` (variant ${p.variant_number})` : ''
        console.log(`  ${index + 1}. ${p.word_variant}${variant}: ${p.phonetic}`)
      })
      
      // Find homophones for each pronunciation
      for (const pronunciation of pronunciations) {
        const homophones = await db('pronunciations')
          .select('word', 'word_variant', 'variant_number')
          .where('phonetic', pronunciation.phonetic)
          .whereNot('word', normalizedWord)
          .orderBy('word')
        
        if (homophones.length > 0) {
          const variant = pronunciation.variant_number ? ` (variant ${pronunciation.variant_number})` : ''
          console.log(`\n🎯 Homophones for "${pronunciation.word_variant}"${variant}:`)
          
          const uniqueWords = new Set()
          homophones.forEach(h => {
            const displayWord = h.variant_number ? `${h.word}(${h.variant_number})` : h.word
            uniqueWords.add(displayWord)
          })
          
          Array.from(uniqueWords).sort().forEach(word => {
            console.log(`  • ${word}`)
          })
        }
      }
      
    } catch (error) {
      console.error(`Error processing "${word}":`, error)
    }
    
    console.log('\n')
  }
  
  console.log('✅ Test completed!')
  await db.destroy()
}

// Run the test
testHomophones()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
  })
