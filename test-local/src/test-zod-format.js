#!/usr/bin/env node

// Test des nouvelles fonctionnalités Zod

import { spawn } from 'child_process';
import { existsSync, unlinkSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runCLI(args) {
  return new Promise((resolve, reject) => {
    const cliPath = join(__dirname, '../../dist/cli/index.js');
    const process = spawn('node', [cliPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    process.on('error', reject);
  });
}

function cleanupFiles() {
  try {
    if (existsSync('./test-zod.ts')) unlinkSync('./test-zod.ts');
    if (existsSync('./test-zod-flat.ts')) unlinkSync('./test-zod-flat.ts');
    if (existsSync('./test-schemas')) rmSync('./test-schemas', { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function testZodFormat() {
  console.log('🧪 Testing Zod Format Generation');
  console.log('=' .repeat(40));

  let testsPassed = 0;
  let testsTotal = 0;

  // Check if credentials are available
  const hasCredentials = process.env.AIRTABLE_PERSONAL_TOKEN && process.env.AIRTABLE_BASE_ID;
  
  if (!hasCredentials) {
    console.log('⚠️  No Airtable credentials found');
    console.log('   Skipping Zod format tests (requires real data)');
    console.log('   Set AIRTABLE_PERSONAL_TOKEN and AIRTABLE_BASE_ID to enable these tests');
    return;
  }

  console.log('🔑 Credentials found, running Zod format tests...\n');

  try {
    // Test 1: Basic Zod schema generation
    testsTotal++;
    console.log('📝 Test 1: Basic Zod schema generation');
    
    const result1 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'zod',
      '--output', 'test-zod.ts'
    ]);

    if (result1.code === 0 && existsSync('./test-zod.ts')) {
      const content = readFileSync('./test-zod.ts', 'utf8');
      
      // Verify Zod-specific content
      const hasZodImport = content.includes("import { z } from 'zod'");
      const hasZodSchema = content.includes('z.object({');
      const hasInferredType = content.includes('z.infer<typeof');
      const hasExportedSchema = content.includes('export const') && content.includes('Schema =');
      
      if (hasZodImport && hasZodSchema && hasInferredType && hasExportedSchema) {
        testsPassed++;
        console.log('✅ Basic Zod schema generation works');
        console.log('   - Contains Zod import');
        console.log('   - Contains z.object() definitions');
        console.log('   - Contains inferred TypeScript types');
        console.log('   - Contains exported schemas');
      } else {
        console.log('❌ Basic Zod schema generation failed');
        console.log('   Missing expected Zod patterns');
        if (!hasZodImport) console.log('   - Missing Zod import');
        if (!hasZodSchema) console.log('   - Missing z.object()');
        if (!hasInferredType) console.log('   - Missing z.infer<>');
        if (!hasExportedSchema) console.log('   - Missing exported schema');
      }
    } else {
      console.log('❌ Basic Zod schema generation failed');
      console.log(`   Exit code: ${result1.code}`);
      if (result1.stderr) console.log(`   Error: ${result1.stderr}`);
    }

    // Test 2: Flattened Zod schema
    testsTotal++;
    console.log('\n📝 Test 2: Flattened Zod schema generation');
    
    const result2 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'zod',
      '--flatten',
      '--output', 'test-zod-flat.ts'
    ]);

    if (result2.code === 0 && existsSync('./test-zod-flat.ts')) {
      const content = readFileSync('./test-zod-flat.ts', 'utf8');
      
      const hasRecordId = content.includes('record_id: z.string()');
      const noFieldsWrapper = !content.includes('fields:');
      
      if (hasRecordId && noFieldsWrapper) {
        testsPassed++;
        console.log('✅ Flattened Zod schema generation works');
        console.log('   - Contains record_id field');
        console.log('   - No fields wrapper (flattened)');
      } else {
        console.log('❌ Flattened Zod schema generation failed');
        if (!hasRecordId) console.log('   - Missing record_id field');
        if (!noFieldsWrapper) console.log('   - Still has fields wrapper');
      }
    } else {
      console.log('❌ Flattened Zod schema generation failed');
      console.log(`   Exit code: ${result2.code}`);
      if (result2.stderr) console.log(`   Error: ${result2.stderr}`);
    }

    // Test 3: Separate files with Zod
    testsTotal++;
    console.log('\n📝 Test 3: Separate files with Zod format');
    
    const result3 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'zod',
      '--separate-files',
      '--output', 'test-schemas'
    ]);

    if (result3.code === 0 && existsSync('./test-schemas')) {
      const indexExists = existsSync('./test-schemas/index.ts');
      let tableFilesExist = false;
      
      if (indexExists) {
        const indexContent = readFileSync('./test-schemas/index.ts', 'utf8');
        const hasZodExports = indexContent.includes('Schema, type') && indexContent.includes("from './");
        const hasValidateFunction = indexContent.includes('export const validateRecord');
        
        // Check for at least one table file
        const files = ['users.ts', 'projects.ts', 'tasks.ts', 'contacts.ts', 'items.ts'].some(file => 
          existsSync(join('./test-schemas', file))
        );
        tableFilesExist = files;
        
        if (hasZodExports && hasValidateFunction && tableFilesExist) {
          testsPassed++;
          console.log('✅ Separate files with Zod format works');
          console.log('   - Index file generated with proper exports');
          console.log('   - Contains validate function');
          console.log('   - Table files generated');
        } else {
          console.log('❌ Separate files with Zod format failed');
          if (!hasZodExports) console.log('   - Missing Zod exports in index');
          if (!hasValidateFunction) console.log('   - Missing validate function');
          if (!tableFilesExist) console.log('   - No table files found');
        }
      } else {
        console.log('❌ Separate files with Zod format failed');
        console.log('   - Index file not generated');
      }
    } else {
      console.log('❌ Separate files with Zod format failed');
      console.log(`   Exit code: ${result3.code}`);
      if (result3.stderr) console.log(`   Error: ${result3.stderr}`);
    }

    // Test 4: Zod validation patterns
    testsTotal++;
    console.log('\n📝 Test 4: Zod validation patterns');
    
    if (existsSync('./test-zod.ts')) {
      const content = readFileSync('./test-zod.ts', 'utf8');
      
      const hasEmailValidation = content.includes('.email(');
      const hasUrlValidation = content.includes('.url(');
      const hasDateTimeValidation = content.includes('.datetime(');
      const hasEnumValidation = content.includes('z.enum([');
      const hasOptionalFields = content.includes('.optional()');
      
      let validationScore = 0;
      if (hasEmailValidation) validationScore++;
      if (hasUrlValidation) validationScore++;
      if (hasDateTimeValidation) validationScore++;
      if (hasEnumValidation) validationScore++;
      if (hasOptionalFields) validationScore++;
      
      if (validationScore >= 3) {
        testsPassed++;
        console.log('✅ Zod validation patterns detected');
        console.log(`   - Found ${validationScore}/5 validation patterns`);
        if (hasEmailValidation) console.log('   - Email validation');
        if (hasUrlValidation) console.log('   - URL validation');
        if (hasDateTimeValidation) console.log('   - DateTime validation');
        if (hasEnumValidation) console.log('   - Enum validation');
        if (hasOptionalFields) console.log('   - Optional fields');
      } else {
        console.log('❌ Insufficient Zod validation patterns');
        console.log(`   - Only found ${validationScore}/5 patterns`);
      }
    } else {
      console.log('❌ No Zod file to analyze for validation patterns');
    }

  } catch (error) {
    console.error('❌ Zod format tests failed with error:', error.message);
  } finally {
    // Cleanup test files
    cleanupFiles();
  }

  // Summary
  console.log('\n' + '=' .repeat(40));
  console.log('🏁 Zod Format Tests Summary');
  console.log(`   Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All Zod format tests passed!');
    console.log('   ✨ Zod schema generation is working correctly');
    console.log('   ✨ Type inference is functional');
    console.log('   ✨ Multi-file generation works with Zod');
    console.log('   ✨ Validation patterns are properly generated');
  } else {
    console.log(`\n⚠️  ${testsTotal - testsPassed} test(s) failed`);
    console.log('   Check the output above for details');
  }
}

// Run the tests
testZodFormat().catch(error => {
  console.error('Fatal error in Zod format tests:', error);
  process.exit(1);
});