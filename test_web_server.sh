#!/bin/bash

echo "🧪 Testing Homophone Finder Web Server"
echo "======================================"
echo

# Test server health
echo "1. Testing server health:"
curl -s "http://localhost:3000/api/health" | grep -o '"success":[^,]*' | head -1
echo

# Test database stats
echo "2. Testing database stats:"
curl -s "http://localhost:3000/api/stats" | grep -o '"total_pronunciations":[0-9]*'
echo

# Test various words
echo "3. Testing word searches:"
echo

words=("there" "to" "right" "see" "break" "read" "lead" "tear")

for word in "${words[@]}"; do
    echo "Testing '$word':"
    result=$(curl -s "http://localhost:3000/api/homophones/$word")
    success=$(echo "$result" | grep -o '"success":[^,]*')
    pronunciations=$(echo "$result" | grep -o '"pronunciations":\[[^]]*\]' | wc -c)
    
    if [[ "$success" == '"success":true' ]]; then
        homophone_count=$(echo "$result" | grep -o '"homophone_count":[0-9]*' | head -1 | grep -o '[0-9]*')
        echo "  ✅ Found ${homophone_count:-0} homophones"
    else
        echo "  ❌ Not found"
    fi
done

echo
echo "4. Testing error handling:"
result=$(curl -s "http://localhost:3000/api/homophones/xyz123notaword")
if echo "$result" | grep -q '"success":false'; then
    echo "  ✅ Error handling works correctly"
else
    echo "  ❌ Error handling failed"
fi

echo
echo "🎉 All tests completed!"
echo "Web interface available at: http://localhost:3000"
