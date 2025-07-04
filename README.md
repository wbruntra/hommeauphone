# Homophone Finder

A command-line tool to find homophones (words that sound the same) using the CMU Pronouncing Dictionary.

## Usage

### Interactive Mode
```bash
node homophones.js
```

This starts an interactive session where you can:
- Type any word to find its homophones
- Type "quit" or "exit" to close the program
- Press Ctrl+C to exit

### Test Mode
```bash
node test_homophones.js
```

Runs a demonstration with common words to show how the homophone finder works.

## Features

- **Complete pronunciation data**: Uses the full CMU Pronouncing Dictionary with 134K+ entries
- **Variant support**: Handles multiple pronunciations for the same word (e.g., "TO" has 3 variants)
- **Case insensitive**: Enter words in any case
- **Grouped results**: Shows homophones organized by base word and variants
- **Phonetic display**: Shows the actual pronunciation that creates the homophone relationship

## Example Output

```
Enter a word: there

🔍 Found 1 pronunciation(s) for "there":
  1. THERE: DH EH1 R

🎯 Homophones for "THERE" [DH EH1 R]:
  Found 2 homophone(s):
    • THEIR
    • THEY'RE
```

## Database

The program uses a SQLite database (`pronunciations.dev.sqlite3`) that contains:
- Base words and their variants
- Phonetic pronunciations in ARPABET format
- Source attribution to CMU Pronouncing Dictionary v0.7b

## Files

- `homophones.js` - Interactive homophone finder
- `test_homophones.js` - Test script with examples
- `load_db.js` - Database loader (run once to populate)
- `check_db.js` - Database verification script
