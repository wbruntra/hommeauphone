# Homophone Finder

A web application and command-line tool to find homophones (words that sound the same) using the CMU Pronouncing Dictionary.

## Setup Instructions

**Important**: The database file is not included in the repository. You must build it yourself using the CMU dictionary data.

### 1. Install Dependencies
```bash
npm install
```

### 2. Download CMU Dictionary
Download the CMU Pronouncing Dictionary v0.7b file and place it in the project root:
```bash
# Download directly (if available)
wget http://svn.code.sf.net/p/cmusphinx/code/trunk/cmudict/cmudict-0.7b

# Or manually download and save as 'cmudict-0.7b' in the project directory
```

### 3. Setup Database (Automated)
```bash
npm run setup
```

This will run the database migrations and load the CMU dictionary data automatically.

**Or do it manually:**

#### 3a. Run Database Migrations
```bash
npm run migrate
# or: npx knex migrate:latest
```

#### 3b. Load Dictionary Data
```bash
npm run load-data
# or: node load_db.js
```

This will process ~134K pronunciation entries and create the SQLite database.

### 4. Start the Web Server
```bash
npm start
# or: node server.js
```

The application will be available at `http://localhost:11001`

## API Endpoints

- `GET /api/homophones/:word` - Find homophones for a single word
- `POST /api/homophones/batch` - Find homophones for multiple words
- `GET /api/health` - Server health check
- `GET /api/stats` - Database statistics (cached)

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

- `server.js` - Express web server with REST API
- `homophones.js` - Interactive command-line homophone finder  
- `homophone_functions.js` - Core homophone search functions (original & optimized)
- `test_homophones.js` - Test script with examples
- `load_db.js` - Database loader script (processes CMU dictionary)
- `check_db.js` - Database verification script
- `performance_analysis.js` - Performance comparison tools
- `migrations/` - Database schema migrations
- `client/` - React frontend application

## Development

### Database Management
```bash
# Check migration status
npm run migrate:status

# Rollback latest migration
npm run migrate:rollback

# Verify database contents
npm run check-db
```

### Performance Testing
```bash
# Compare original vs optimized implementations
npm run performance

# Simple performance test
npm run performance:simple
```

## Notes

- Database file (`*.sqlite3`) is excluded from git - you must build it locally
- CMU dictionary file (`cmudict-0.7b`) is excluded from git - download separately  
- Performance optimizations use single-query approach with Map-based grouping
- Composite database index on `(phonetic, word)` improves query performance
