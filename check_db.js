const db = require('./db_connection')

const checkDatabase = async () => {
  try {
    console.log('Checking pronunciation database...\n')
    
    // Check total count
    const totalCount = await db('pronunciations').count('id as count').first()
    console.log(`Total pronunciations: ${totalCount.count}`)
    
    // Check base words vs variants
    const baseWordsCount = await db('pronunciations')
      .whereNull('variant_number')
      .count('id as count')
      .first()
    
    const variantsCount = await db('pronunciations')
      .whereNotNull('variant_number')
      .count('id as count')
      .first()
    
    console.log(`Base pronunciations: ${baseWordsCount.count}`)
    console.log(`Variant pronunciations: ${variantsCount.count}`)
    
    // Sample some entries
    console.log('\nSample entries:')
    const samples = await db('pronunciations')
      .select('word', 'word_variant', 'variant_number', 'phonetic')
      .limit(10)
    
    samples.forEach(entry => {
      const variant = entry.variant_number ? ` (variant ${entry.variant_number})` : ''
      console.log(`${entry.word}${variant}: ${entry.phonetic}`)
    })
    
    // Check for words with multiple variants
    console.log('\nWords with multiple pronunciations:')
    const multipleVariants = await db('pronunciations')
      .select('word')
      .count('id as count')
      .groupBy('word')
      .having('count', '>', 1)
      .orderBy('count', 'desc')
      .limit(5)
    
    for (const word of multipleVariants) {
      console.log(`\n${word.word} (${word.count} pronunciations):`)
      const variants = await db('pronunciations')
        .select('word_variant', 'variant_number', 'phonetic')
        .where('word', word.word)
        .orderBy('variant_number')
      
      variants.forEach(variant => {
        const num = variant.variant_number ? ` (${variant.variant_number})` : ''
        console.log(`  ${variant.word_variant}${num}: ${variant.phonetic}`)
      })
    }
    
    // Check source information
    console.log('\nSource information:')
    const sources = await db('pronunciations')
      .select('source')
      .count('id as count')
      .groupBy('source')
    
    sources.forEach(source => {
      console.log(`${source.source}: ${source.count} entries`)
    })
    
    // Check for any data integrity issues
    console.log('\nData integrity checks:')
    
    const emptyWords = await db('pronunciations')
      .whereNull('word')
      .orWhere('word', '')
      .count('id as count')
      .first()
    console.log(`Empty words: ${emptyWords.count}`)
    
    const emptyPhonetics = await db('pronunciations')
      .whereNull('phonetic')
      .orWhere('phonetic', '')
      .count('id as count')
      .first()
    console.log(`Empty phonetics: ${emptyPhonetics.count}`)
    
    const mismatchedVariants = await db('pronunciations')
      .whereNotNull('variant_number')
      .whereRaw('word_variant NOT LIKE word || "(" || variant_number || ")"')
      .count('id as count')
      .first()
    console.log(`Mismatched variant data: ${mismatchedVariants.count}`)
    
    console.log('\nDatabase check complete!')
    
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    await db.destroy()
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log('\nCheck completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error during check:', error)
    process.exit(1)
  })
