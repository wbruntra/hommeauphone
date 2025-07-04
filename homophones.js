const db = require('./db_connection')
const readline = require('readline')

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Function to find homophones for a given word
const findHomophones = async (inputWord) => {
  try {
    const normalizedWord = inputWord.toUpperCase().trim()
    
    // First, find all pronunciations for the input word
    const pronunciations = await db('pronunciations')
      .select('phonetic', 'word_variant', 'variant_number')
      .where('word', normalizedWord)
      .orderBy('variant_number')
    
    if (pronunciations.length === 0) {
      console.log(`\n❌ Word "${inputWord}" not found in the pronunciation dictionary.`)
      return
    }
    
    console.log(`\n🔍 Found ${pronunciations.length} pronunciation(s) for "${inputWord}":`)
    pronunciations.forEach((p, index) => {
      const variant = p.variant_number ? ` (variant ${p.variant_number})` : ''
      console.log(`  ${index + 1}. ${p.word_variant}${variant}: ${p.phonetic}`)
    })
    
    // Find homophones for each pronunciation
    for (let i = 0; i < pronunciations.length; i++) {
      const pronunciation = pronunciations[i]
      const variant = pronunciation.variant_number ? ` (variant ${pronunciation.variant_number})` : ''
      
      console.log(`\n🎯 Homophones for "${pronunciation.word_variant}"${variant} [${pronunciation.phonetic}]:`)
      
      // Find all words with the same phonetic pronunciation
      const homophones = await db('pronunciations')
        .select('word', 'word_variant', 'variant_number')
        .where('phonetic', pronunciation.phonetic)
        .whereNot('word', normalizedWord) // Exclude the original word
        .orderBy('word')
        .orderBy('variant_number')
      
      if (homophones.length === 0) {
        console.log('  No homophones found.')
      } else {
        console.log(`  Found ${homophones.length} homophone(s):`)
        
        // Group by base word to show variants together
        const groupedHomophones = {}
        homophones.forEach(h => {
          if (!groupedHomophones[h.word]) {
            groupedHomophones[h.word] = []
          }
          groupedHomophones[h.word].push(h)
        })
        
        Object.keys(groupedHomophones).forEach(baseWord => {
          const variants = groupedHomophones[baseWord]
          if (variants.length === 1 && variants[0].variant_number === null) {
            // Single base word
            console.log(`    • ${variants[0].word}`)
          } else {
            // Word with variants
            console.log(`    • ${baseWord}`)
            variants.forEach(v => {
              const variantText = v.variant_number ? ` (variant ${v.variant_number})` : ' (base)'
              console.log(`      ${v.word_variant}${variantText}`)
            })
          }
        })
      }
    }
  } catch (error) {
    console.error('Error finding homophones:', error)
  }
}

// Function to start the interactive session
const startHomophoneSearch = () => {
  console.log('🎵 Welcome to the Homophone Finder!')
  console.log('Type a word to find its homophones, or "quit" to exit.\n')
  
  const askForWord = () => {
    rl.question('Enter a word: ', async (input) => {
      const trimmedInput = input.trim()
      
      if (trimmedInput.toLowerCase() === 'quit' || trimmedInput.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!')
        await db.destroy()
        rl.close()
        process.exit(0)
      }
      
      if (trimmedInput === '') {
        console.log('Please enter a word.')
        askForWord()
        return
      }
      
      await findHomophones(trimmedInput)
      console.log('\n' + '─'.repeat(50))
      askForWord()
    })
  }
  
  askForWord()
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Goodbye!')
  await db.destroy()
  rl.close()
  process.exit(0)
})

// Start the program
console.log('Loading pronunciation database...')
db.raw('SELECT 1').then(() => {
  console.log('✅ Database connected successfully!')
  startHomophoneSearch()
}).catch((error) => {
  console.error('❌ Error connecting to database:', error)
  process.exit(1)
})
