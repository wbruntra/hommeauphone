const db = require('./db_connection')
const { findHomophonesOriginal, findHomophonesOptimized } = require('./homophone_functions')

// Performance testing utilities
const measurePerformance = async (fn, word, iterations = 1) => {
  const times = []
  let result = null
  
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint()
    result = await fn(word)
    const end = process.hrtime.bigint()
    times.push(Number(end - start) / 1000000) // Convert to milliseconds
  }
  
  return {
    result,
    times,
    avgTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    totalTime: times.reduce((a, b) => a + b, 0)
  }
}

const testWords = [
  'THERE',      // Common word with homophones
  'TO',         // Very common word
  'RIGHT',      // Word with multiple pronunciations
  'THEIR',      // Another common homophone
  'BEAR',       // Word with homophones
  'NIGHT',      // Common word
  'WRITE',      // Part of write/right/rite group
  'KNOW',       // Part of know/no group
  'SEE',        // Part of see/sea group
  'FOUR'        // Part of four/for/fore group
]

const runSingleWordAnalysis = async (word) => {
  console.log(`\n🔍 Testing word: "${word}"`)
  console.log('=' .repeat(50))
  
  try {
    // Test original implementation
    const originalResults = await measurePerformance(findHomophonesOriginal, word, 5)
    
    // Test optimized implementation
    const optimizedResults = await measurePerformance(findHomophonesOptimized, word, 5)
    
    // Verify results are equivalent
    const originalSuccess = originalResults.result.success
    const optimizedSuccess = optimizedResults.result.success
    const resultsMatch = originalSuccess === optimizedSuccess
    
    if (originalSuccess && optimizedSuccess) {
      const originalCount = originalResults.result.pronunciations.length
      const optimizedCount = optimizedResults.result.pronunciations.length
      console.log(`✅ Both found ${originalCount} pronunciations`)
    } else if (!originalSuccess && !optimizedSuccess) {
      console.log(`❌ Both failed to find word`)
    } else {
      console.log(`⚠️  Results differ! Original: ${originalSuccess}, Optimized: ${optimizedSuccess}`)
    }
    
    // Performance comparison
    const speedup = originalResults.avgTime / optimizedResults.avgTime
    const timeSaved = originalResults.avgTime - optimizedResults.avgTime
    
    console.log(`\n📊 Performance Results:`)
    console.log(`Original    - Avg: ${originalResults.avgTime.toFixed(2)}ms, Min: ${originalResults.minTime.toFixed(2)}ms, Max: ${originalResults.maxTime.toFixed(2)}ms`)
    console.log(`Optimized   - Avg: ${optimizedResults.avgTime.toFixed(2)}ms, Min: ${optimizedResults.minTime.toFixed(2)}ms, Max: ${optimizedResults.maxTime.toFixed(2)}ms`)
    console.log(`Speedup     - ${speedup.toFixed(2)}x faster (${timeSaved.toFixed(2)}ms saved per call)`)
    
    return {
      word,
      originalAvg: originalResults.avgTime,
      optimizedAvg: optimizedResults.avgTime,
      speedup,
      timeSaved,
      resultsMatch
    }
  } catch (error) {
    console.error(`❌ Error testing word "${word}":`, error.message)
    return {
      word,
      error: error.message
    }
  }
}

const runBatchAnalysis = async (words, batchSize = 10) => {
  console.log(`\n🚀 Batch Analysis (${batchSize} words)`)
  console.log('=' .repeat(50))
  
  const testBatch = words.slice(0, batchSize)
  
  // Test original approach (sequential)
  console.log('Testing original batch approach...')
  const originalStart = process.hrtime.bigint()
  const originalResults = []
  for (const word of testBatch) {
    const result = await findHomophonesOriginal(word)
    originalResults.push(result)
  }
  const originalEnd = process.hrtime.bigint()
  const originalBatchTime = Number(originalEnd - originalStart) / 1000000
  
  // Test optimized approach
  console.log('Testing optimized batch approach...')
  const optimizedStart = process.hrtime.bigint()
  const optimizedResults = []
  for (const word of testBatch) {
    const result = await findHomophonesOptimized(word)
    optimizedResults.push(result)
  }
  const optimizedEnd = process.hrtime.bigint()
  const optimizedBatchTime = Number(optimizedEnd - optimizedStart) / 1000000
  
  console.log(`\n📊 Batch Performance Results (${batchSize} words):`)
  console.log(`Original: ${originalBatchTime.toFixed(2)}ms`)
  console.log(`Optimized: ${optimizedBatchTime.toFixed(2)}ms`)
  console.log(`Speedup: ${(originalBatchTime / optimizedBatchTime).toFixed(2)}x`)
  console.log(`Time saved: ${(originalBatchTime - optimizedBatchTime).toFixed(2)}ms`)
  
  return {
    batchSize,
    originalTime: originalBatchTime,
    optimizedTime: optimizedBatchTime,
    speedup: originalBatchTime / optimizedBatchTime,
    timeSaved: originalBatchTime - optimizedBatchTime
  }
}

const runFullAnalysis = async () => {
  console.log('🎯 Homophone Function Performance Analysis')
  console.log('=' .repeat(60))
  
  // Single word tests
  console.log('\n📋 SINGLE WORD TESTS')
  const singleWordResults = []
  for (const word of testWords) {
    const result = await runSingleWordAnalysis(word)
    if (!result.error) {
      singleWordResults.push(result)
    }
  }
  
  // Summary of single word tests
  if (singleWordResults.length > 0) {
    const avgSpeedup = singleWordResults.reduce((sum, r) => sum + r.speedup, 0) / singleWordResults.length
    const totalTimeSaved = singleWordResults.reduce((sum, r) => sum + r.timeSaved, 0)
    const allResultsMatch = singleWordResults.every(r => r.resultsMatch)
    
    console.log(`\n📈 SINGLE WORD SUMMARY`)
    console.log('=' .repeat(50))
    console.log(`✅ Tests completed: ${singleWordResults.length}/${testWords.length}`)
    console.log(`✅ Results match: ${allResultsMatch ? 'Yes' : 'No'}`)
    console.log(`⚡ Average speedup: ${avgSpeedup.toFixed(2)}x`)
    console.log(`⏱️  Total time saved: ${totalTimeSaved.toFixed(2)}ms`)
  }
  
  // Batch tests
  console.log(`\n📋 BATCH TESTS`)
  await runBatchAnalysis(testWords, 5)
  await runBatchAnalysis(testWords, 10)
  
  console.log(`\n🎉 Analysis Complete!`)
  
  // Close database connection
  await db.destroy()
}

// Run the analysis
if (require.main === module) {
  runFullAnalysis().catch(console.error)
}

module.exports = {
  findHomophonesOriginal,
  findHomophonesOptimized,
  measurePerformance,
  runSingleWordAnalysis,
  runBatchAnalysis,
  runFullAnalysis
}
