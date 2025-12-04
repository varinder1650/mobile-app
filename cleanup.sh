#!/bin/bash
# cleanup.sh - Remove unnecessary files and code

echo "🧹 Starting SmartBag cleanup..."

# ✅ PHASE 1: Delete unused files
echo "📁 Removing unused files..."

# Remove Expo template file
rm -f scripts/reset-project.js
echo "  ✅ Removed reset-project.js"

# Remove unused API files if they exist
if [ -f "utils/api.js" ]; then
  # Check if it's actually used
  grep -r "from.*api.js" app/ contexts/ components/ || rm -f utils/api.js
  echo "  ✅ Checked api.js"
fi

# ✅ PHASE 2: Remove commented code blocks
echo "🔍 Finding commented code blocks..."

# List files with large commented blocks
find app -name "*.tsx" -o -name "*.ts" | while read file; do
  # Count commented lines
  commented=$(grep -c "^[[:space:]]*\/\/" "$file" 2>/dev/null || echo 0)
  total=$(wc -l < "$file")
  
  if [ $commented -gt 10 ]; then
    percentage=$((commented * 100 / total))
    if [ $percentage -gt 20 ]; then
      echo "  ⚠️  $file has $commented/$total commented lines ($percentage%)"
    fi
  fi
done

# ✅ PHASE 3: Find duplicate code
echo "🔍 Checking for duplicate functions..."

# Common duplicates to check
echo "  📋 Checking formatDate duplicates..."
grep -r "formatDate.*=.*dateString" app/ utils/ | wc -l

echo "  📋 Checking getImageUrl duplicates..."
grep -r "getImageUrl" app/ utils/ | wc -l

# ✅ PHASE 4: List large files that might need splitting
echo "📊 Finding large files (>500 lines)..."
find app -name "*.tsx" -o -name "*.ts" | while read file; do
  lines=$(wc -l < "$file")
  if [ $lines -gt 500 ]; then
    echo "  📄 $file: $lines lines (consider splitting)"
  fi
done

# ✅ PHASE 5: Check for console.logs
echo "🔍 Finding console.log statements..."
total_logs=$(grep -r "console\.log" app/ | wc -l)
echo "  📊 Total console.log statements: $total_logs"
echo "  💡 Consider using DEBUG flag: if (__DEV__) console.log()"

# ✅ PHASE 6: Check bundle size estimate
echo "📦 Checking node_modules size..."
du -sh node_modules/ 2>/dev/null || echo "  ⚠️  node_modules not found"

echo ""
echo "✅ Cleanup analysis complete!"
echo ""
echo "📋 RECOMMENDED ACTIONS:"
echo "1. Remove large commented blocks in these files:"
echo "   - app/auth/login.tsx"
echo "   - app/auth/register.tsx"
echo "   - app/auth/phone.tsx"
echo "   - app/auth/forgot-password.tsx"
echo ""
echo "2. Replace console.log with DEBUG flag:"
echo "   const DEBUG = __DEV__;"
echo "   if (DEBUG) console.log('...');"
echo ""
echo "3. Consider splitting large files (>500 lines) into smaller modules"
echo ""
echo "4. Run: npx react-native-clean-project for deep clean"