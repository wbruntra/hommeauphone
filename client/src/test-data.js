// Test data for sentence editor functionality
const testSentences = [
  "I can see the blue sea from here.",
  "There house is over their.",
  "The KNIGHT rode through the NIGHT.",
  "We ate eight apples today.",
  "Please write the right answer."
]

const expectedBehavior = {
  "Word replacement should": [
    "Preserve case of original word",
    "Not trigger re-analysis of sentence", 
    "Maintain layout without flickering",
    "Show inline loading indicator when analyzing new text",
    "Only show full loading when no analyzed text exists"
  ]
}

console.log("Test sentences for sentence editor:", testSentences)
console.log("Expected behavior:", expectedBehavior)
