const db = require('./db_connection')

// Original implementation (sequential queries)
const findHomophonesOriginal = async (inputWord) => {
  try {
    const normalizedWord = inputWord.toUpperCase().trim()

    // 1. Get pronunciations for the source word
    const pronunciations = await db('pronunciations')
      .select('phonetic', 'word_variant', 'variant_number')
      .where('word', normalizedWord)
      .orderBy('variant_number')

    if (!pronunciations.length) {
      return { success: false, message: `Word "${inputWord}" not found in the pronunciation dictionary.`, word: inputWord }
    }

    // 2. Sequential queries for each pronunciation (INEFFICIENT)
    const pronunciationResults = []
    for (const pron of pronunciations) {
      const homophones = await db('pronunciations')
        .select('word', 'word_variant', 'variant_number')
        .where('phonetic', pron.phonetic)
        .whereNot('word', normalizedWord)
        .orderBy(['word', 'variant_number'])

      // Group by word using plain objects
      const homophoneGroups = {}
      homophones.forEach(h => {
        if (!homophoneGroups[h.word]) {
          homophoneGroups[h.word] = []
        }
        homophoneGroups[h.word].push(h)
      })

      const homophoneList = Object.keys(homophoneGroups).sort().map(base => {
        const variants = homophoneGroups[base]
        return (variants.length === 1 && variants[0].variant_number === null)
          ? { word: base, variants: [] }
          : { word: base, variants: variants.map(v => ({ word_variant: v.word_variant, variant_number: v.variant_number })) }
      })

      pronunciationResults.push({
        word_variant: pron.word_variant,
        variant_number: pron.variant_number,
        phonetic: pron.phonetic,
        homophones: homophoneList,
        homophone_count: Object.keys(homophoneGroups).length
      })
    }

    return { success: true, word: inputWord, pronunciations: pronunciationResults }
  } catch (error) {
    console.error('Error finding homophones (original):', error)
    return { success: false, message: 'An error occurred while searching for homophones.', error: error.message }
  }
}

// Optimized implementation (single DB round-trip & Map-based grouping)
const findHomophonesOptimized = async (inputWord) => {
  try {
    const normalizedWord = inputWord.toUpperCase().trim()

    // 1. Pronunciations for the source word
    const pronunciations = await db('pronunciations')
      .select('phonetic', 'word_variant', 'variant_number')
      .where('word', normalizedWord)
      .orderBy('variant_number')

    if (!pronunciations.length) {
      return { success: false, message: `Word "${inputWord}" not found in the pronunciation dictionary.`, word: inputWord }
    }

    // 2. Fetch every homophone in ONE query
    const phonetics = pronunciations.map(p => p.phonetic)
    const rows = await db('pronunciations')
      .select('phonetic', 'word', 'word_variant', 'variant_number')
      .whereIn('phonetic', phonetics)
      .whereNot('word', normalizedWord)
      .orderBy(['phonetic', 'word', 'variant_number'])

    // 3. Group by phonetic → word using Maps
    const byPhonetic = new Map()
    rows.forEach(r => {
      if (!byPhonetic.has(r.phonetic)) byPhonetic.set(r.phonetic, new Map())
      const wordsMap = byPhonetic.get(r.phonetic)
      if (!wordsMap.has(r.word)) wordsMap.set(r.word, [])
      wordsMap.get(r.word).push(r)
    })

    // 4. Build response
    const pronunciationResults = pronunciations.map(pron => {
      const wordsMap = byPhonetic.get(pron.phonetic) || new Map()
      const homophoneList = [...wordsMap.keys()].map(base => {
        const variants = wordsMap.get(base)
        return (variants.length === 1 && variants[0].variant_number === null)
          ? { word: base, variants: [] }
          : { word: base, variants: variants.map(v => ({ word_variant: v.word_variant, variant_number: v.variant_number })) }
      })

      return {
        word_variant: pron.word_variant,
        variant_number: pron.variant_number,
        phonetic: pron.phonetic,
        homophones: homophoneList,
        homophone_count: (byPhonetic.get(pron.phonetic) || new Map()).size
      }
    })

    return { success: true, word: inputWord, pronunciations: pronunciationResults }
  } catch (error) {
    console.error('Error finding homophones (optimized):', error)
    return { success: false, message: 'An error occurred while searching for homophones.', error: error.message }
  }
}

module.exports = {
  findHomophonesOriginal,
  findHomophonesOptimized
}
