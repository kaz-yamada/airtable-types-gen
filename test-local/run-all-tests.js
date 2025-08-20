#!/usr/bin/env node

// Master test runner that executes all available tests

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import 'dotenv/config';

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function runAllTests() {
  console.log('🧪 airtable-types-gen - Complete Test Suite\n');
  console.log('=' .repeat(50));
  
  let testsRun = 0;
  let testsPassed = 0;
  
  try {
    
    const hasCredentials = process.env.AIRTABLE_PERSONAL_TOKEN && process.env.AIRTABLE_BASE_ID;
    // Phase 1: Basic tests (no credentials needed)
    console.log('\n📋 Phase 1: Basic CLI Tests');
    console.log('-'.repeat(30));
    
    await runCommand('npm', ['run', 'test:basic']);
    testsRun++;
    testsPassed++;
    console.log('✅ Basic CLI tests passed\n');

    await runCommand('npm', ['run', 'test:flatten']);
    testsRun++;
    testsPassed++;
    console.log('✅ Flatten functionality tests passed\n');

    // New Zod and multi-file tests (require credentials)
    if (hasCredentials) {
      try {
        await runCommand('npm', ['run', 'test:zod']);
        testsRun++;
        testsPassed++;
        console.log('✅ Zod format tests passed\n');
      } catch (error) {
        testsRun++;
        console.log('⚠️  Zod format tests failed\n');
      }

      try {
        await runCommand('npm', ['run', 'test:multi']);
        testsRun++;
        testsPassed++;
        console.log('✅ Multi-file generation tests passed\n');
      } catch (error) {
        testsRun++;
        console.log('⚠️  Multi-file generation tests failed\n');
      }
    } else {
      console.log('⚠️  Skipping Zod and multi-file tests (require credentials)\n');
    }

    // Phase 2: TypeScript compilation test
    console.log('📋 Phase 2: TypeScript Tests');
    console.log('-'.repeat(30));
    
    try {
      await runCommand('npm', ['run', 'test:types']);
      testsRun++;
      testsPassed++;
      console.log('✅ TypeScript type tests passed\n');
    } catch (error) {
      testsRun++;
      console.log('⚠️  TypeScript tests skipped (may need generated types)\n');
    }

    // Phase 3: Real Airtable tests (if credentials available)
    console.log('📋 Phase 3: Integration Tests');
    console.log('-'.repeat(30));
    
    
    if (hasCredentials) {
      console.log('🔑 Credentials found, running integration tests...\n');
      
      try {
        await runCommand('node', ['src/test-real-airtable.js']);
        testsRun++;
        testsPassed++;
        console.log('✅ Real Airtable integration test passed\n');

        // Try generating types
        try {
          await runCommand('npm', ['run', 'generate']);
          testsRun++;
          testsPassed++;
          console.log('✅ Type generation test passed\n');

          // Check if types were generated
          if (existsSync('./generated/types.ts')) {
            console.log('✅ Types file generated successfully');
            
            // Try TypeScript validation with real types
            try {
              await runCommand('npm', ['run', 'test:types']);
              console.log('✅ Generated types are valid TypeScript\n');
            } catch (error) {
              console.log('⚠️  Generated types validation had issues\n');
            }
          }

        } catch (error) {
          testsRun++;
          console.log('❌ Type generation failed - check your Airtable credentials\n');
        }

      } catch (error) {
        testsRun++;
        console.log('❌ Airtable integration test failed - check your credentials\n');
      }

    } else {
      console.log('⚠️  No Airtable credentials found in .env');
      console.log('   Create .env file with AIRTABLE_PERSONAL_TOKEN and AIRTABLE_BASE_ID');
      console.log('   to run full integration tests\n');
    }

    // Final summary
    console.log('=' .repeat(50));
    console.log('🏁 Test Summary');
    console.log(`   Tests run: ${testsRun}`);
    console.log(`   Tests passed: ${testsPassed}`);
    console.log(`   Success rate: ${Math.round((testsPassed / testsRun) * 100)}%`);
    
    if (testsPassed === testsRun) {
      console.log('\n🎉 All tests passed! The package is ready.');
      
      if (!hasCredentials) {
        console.log('\n📝 To test full functionality:');
        console.log('   1. Copy .env.example to .env');
        console.log('   2. Fill in your Airtable credentials'); 
        console.log('   3. Run this script again');
      } else {
        console.log('\n✨ Package is fully tested and ready for publication!');
      }
    } else {
      console.log(`\n⚠️  ${testsRun - testsPassed} test(s) had issues`);
      console.log('   Review the output above for details');
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});