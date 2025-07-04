const { runFullAnalysis } = require('./performance_analysis')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

const runIndexComparison = async () => {
  console.log('🗂️  Database Index Performance Comparison')
  console.log('=' .repeat(60))
  
  try {
    // Test WITHOUT the index (rollback latest migration)
    console.log('\n📉 Rolling back to test WITHOUT the composite index...')
    await execAsync('npx knex migrate:rollback')
    console.log('✅ Migration rolled back')
    
    console.log('\n🔬 Testing performance WITHOUT index:')
    console.log('=' .repeat(60))
    await runFullAnalysis()
    
    // Wait a moment to let things settle
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Test WITH the index (apply latest migration)
    console.log('\n📈 Applying migration to test WITH the composite index...')
    await execAsync('npx knex migrate:latest')
    console.log('✅ Migration applied')
    
    console.log('\n🔬 Testing performance WITH index:')
    console.log('=' .repeat(60))
    await runFullAnalysis()
    
    console.log('\n🎯 Index Comparison Complete!')
    console.log('Compare the two sets of results above to see the index impact.')
    
  } catch (error) {
    console.error('❌ Error during index comparison:', error.message)
    
    // Try to restore to latest state
    try {
      console.log('🔄 Attempting to restore to latest migration state...')
      await execAsync('npx knex migrate:latest')
      console.log('✅ Restored to latest migration')
    } catch (restoreError) {
      console.error('❌ Failed to restore migration state:', restoreError.message)
    }
  }
}

// Run the comparison
if (require.main === module) {
  runIndexComparison().catch(console.error)
}

module.exports = { runIndexComparison }
