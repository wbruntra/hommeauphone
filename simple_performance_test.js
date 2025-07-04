const { findHomophonesOriginal, findHomophonesOptimized } = require('./homophone_functions')

const testSingleWord = async (word, iterations = 3) => {
  console.log(`\n🔍 Testing "${word}"`)
  
  // Test original
  const originalTimes = []
  let originalResult = null
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint()
    originalResult = await findHomophonesOriginal(word)
    const end = process.hrtime.bigint()
    originalTimes.push(Number(end - start) / 1000000)
  }
  
  // Test optimized
  const optimizedTimes = []
  let optimizedResult = null
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint()
    optimizedResult = await findHomophonesOptimized(word)
    const end = process.hrtime.bigint()
    optimizedTimes.push(Number(end - start) / 1000000)
  }
  
  const originalAvg = originalTimes.reduce((a, b) => a + b, 0) / originalTimes.length
  const optimizedAvg = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length
  const speedup = originalAvg / optimizedAvg
  
  console.log(`Original: ${originalAvg.toFixed(2)}ms`)
  console.log(`Optimized: ${optimizedAvg.toFixed(2)}ms`)
  console.log(`Speedup: ${speedup.toFixed(2)}x`)
  console.log(`Results match: ${originalResult.success === optimizedResult.success}`)
  
  return { word, originalAvg, optimizedAvg, speedup }
}

const runSimpleTest = async () => {
  console.log('🚀 Simple Performance Test')
  console.log('=' .repeat(40))
  
  const testWords = ['THERE', 'TO', 'RIGHT', 'THEIR', 'BEAR']
  const results = []
  
  for (const word of testWords) {
    try {
      const result = await testSingleWord(word)
      results.push(result)
    } catch (error) {
      console.error(`❌ Error testing ${word}:`, error.message)
    }
  }
  
  // Summary
  if (results.length > 0) {
    const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length
    console.log(`\n📊 Summary`)
    console.log(`Tests completed: ${results.length}/${testWords.length}`)
    console.log(`Average speedup: ${avgSpeedup.toFixed(2)}x`)
  }
  
  // Close DB connection
  const db = require('./db_connection')
  await db.destroy()
}

// Run the test
if (require.main === module) {
  runSimpleTest().catch(console.error)
}

module.exports = { runSimpleTest }
