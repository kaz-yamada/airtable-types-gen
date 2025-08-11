#!/usr/bin/env node

// Basic test of the CLI without needing real Airtable credentials
// This tests the CLI options parsing and help functionality

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '..', '..', 'dist', 'cli', 'index.js');

console.log('🧪 Testing airtable-types-gen CLI...\n');

// Test 1: Help command
console.log('📖 Test 1: Help command');
const helpProcess = spawn('node', [cliPath, '--help'], { stdio: 'pipe' });

helpProcess.stdout.on('data', (data) => {
  console.log('✅ Help output received:');
  console.log(data.toString().substring(0, 200) + '...\n');
});

helpProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Help command works!\n');
    
    // Test 2: Version command
    console.log('📊 Test 2: Version command');
    const versionProcess = spawn('node', [cliPath, '--version'], { stdio: 'pipe' });
    
    versionProcess.stdout.on('data', (data) => {
      console.log('✅ Version:', data.toString().trim());
    });
    
    versionProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Version command works!\n');
        
        // Test 3: Error handling (missing base-id)
        console.log('⚠️  Test 3: Error handling (missing base-id)');
        const errorProcess = spawn('node', [cliPath], { stdio: 'pipe' });
        
        errorProcess.stderr.on('data', (data) => {
          const error = data.toString();
          if (error.includes('Base ID is required')) {
            console.log('✅ Error handling works: Base ID validation');
          }
        });
        
        errorProcess.on('close', (code) => {
          if (code !== 0) {
            console.log('✅ CLI correctly exits with error code\n');
            console.log('🎉 All basic CLI tests passed!\n');
            console.log('📝 Next steps:');
            console.log('   1. Copy .env.example to .env');
            console.log('   2. Fill in your Airtable credentials');
            console.log('   3. Run: npm run generate');
            console.log('   4. Run: npm run test:flatten');
          }
        });
      }
    });
  }
});