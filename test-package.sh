#!/bin/bash

# Script de test rapide pour airtable-types-gen
# Lance tous les tests en local avant publication

echo "🧪 airtable-types-gen - Test Package Script"
echo "========================================="
echo

# Étape 1: Build du package principal
echo "📦 Step 1: Building main package..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before testing."
    exit 1
fi

echo "✅ Build successful!"
echo

# Étape 2: Aller dans le dossier de test
echo "📁 Step 2: Setting up test environment..."
cd test-local

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
fi

# Étape 3: Lancer tous les tests
echo "🚀 Step 3: Running all tests..."
echo
npm test

echo
echo "🏁 Test completed!"
echo
echo "📝 Next steps:"
echo "   - If all tests passed: Your package is ready for publication!"
echo "   - If some tests failed: Review the output and fix issues"
echo "   - To test with real Airtable: Configure test-local/.env with your credentials"
echo
echo "🚀 To publish:"
echo "   npm publish"