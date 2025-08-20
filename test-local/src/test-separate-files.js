#!/usr/bin/env node

// Test des nouvelles fonctionnalités de génération multi-fichiers

import { spawn } from 'child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'fs';
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

function cleanupDirectories() {
  try {
    const dirsToClean = ['./test-ts-multi', './test-zod-multi', './test-flat-multi'];
    dirsToClean.forEach(dir => {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function testSeparateFiles() {
  console.log('🗂️  Testing Separate Files Generation');
  console.log('=' .repeat(45));

  let testsPassed = 0;
  let testsTotal = 0;

  // Check if credentials are available
  const hasCredentials = process.env.AIRTABLE_PERSONAL_TOKEN && process.env.AIRTABLE_BASE_ID;
  
  if (!hasCredentials) {
    console.log('⚠️  No Airtable credentials found');
    console.log('   Skipping separate files tests (requires real data)');
    console.log('   Set AIRTABLE_PERSONAL_TOKEN and AIRTABLE_BASE_ID to enable these tests');
    return;
  }

  console.log('🔑 Credentials found, running separate files tests...\n');

  try {
    // Test 1: TypeScript separate files
    testsTotal++;
    console.log('📁 Test 1: TypeScript separate files');
    
    const result1 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'typescript',
      '--separate-files',
      '--output', 'test-ts-multi'
    ]);

    if (result1.code === 0 && existsSync('./test-ts-multi')) {
      const files = readdirSync('./test-ts-multi');
      const hasIndex = files.includes('index.ts');
      const hasTableFiles = files.some(f => f.endsWith('.ts') && f !== 'index.ts');
      
      if (hasIndex && hasTableFiles) {
        const indexContent = readFileSync('./test-ts-multi/index.ts', 'utf8');
        const hasTypeExports = indexContent.includes('export type {') && indexContent.includes('Record }');
        const hasUtilityTypes = indexContent.includes('AirtableTableName') && indexContent.includes('GetTableRecord');
        
        if (hasTypeExports && hasUtilityTypes) {
          testsPassed++;
          console.log('✅ TypeScript separate files generation works');
          console.log(`   - Generated ${files.length} files`);
          console.log('   - Index file with proper exports');
          console.log('   - Utility types included');
          console.log(`   - Table files: ${files.filter(f => f !== 'index.ts').join(', ')}`);
        } else {
          console.log('❌ TypeScript separate files generation failed');
          console.log('   Missing proper exports or utility types');
        }
      } else {
        console.log('❌ TypeScript separate files generation failed');
        if (!hasIndex) console.log('   - Missing index.ts');
        if (!hasTableFiles) console.log('   - No table files generated');
      }
    } else {
      console.log('❌ TypeScript separate files generation failed');
      console.log(`   Exit code: ${result1.code}`);
      if (result1.stderr) console.log(`   Error: ${result1.stderr}`);
    }

    // Test 2: Zod separate files
    testsTotal++;
    console.log('\n📁 Test 2: Zod separate files');
    
    const result2 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'zod',
      '--separate-files',
      '--output', 'test-zod-multi'
    ]);

    if (result2.code === 0 && existsSync('./test-zod-multi')) {
      const files = readdirSync('./test-zod-multi');
      const hasIndex = files.includes('index.ts');
      const hasTableFiles = files.some(f => f.endsWith('.ts') && f !== 'index.ts');
      
      if (hasIndex && hasTableFiles) {
        const indexContent = readFileSync('./test-zod-multi/index.ts', 'utf8');
        const hasZodExports = indexContent.includes('Schema, type') && indexContent.includes("from './");
        const hasValidateFunction = indexContent.includes('validateRecord');
        
        // Check a table file for Zod content
        const tableFile = files.find(f => f.endsWith('.ts') && f !== 'index.ts');
        const tableContent = readFileSync(join('./test-zod-multi', tableFile), 'utf8');
        const hasZodImport = tableContent.includes("import { z } from 'zod'");
        const hasZodSchema = tableContent.includes('z.object({');
        
        if (hasZodExports && hasValidateFunction && hasZodImport && hasZodSchema) {
          testsPassed++;
          console.log('✅ Zod separate files generation works');
          console.log(`   - Generated ${files.length} files`);
          console.log('   - Index file with Zod exports');
          console.log('   - Validation utilities included');
          console.log('   - Table files contain Zod schemas');
        } else {
          console.log('❌ Zod separate files generation failed');
          console.log('   Missing proper Zod patterns');
        }
      } else {
        console.log('❌ Zod separate files generation failed');
        if (!hasIndex) console.log('   - Missing index.ts');
        if (!hasTableFiles) console.log('   - No table files generated');
      }
    } else {
      console.log('❌ Zod separate files generation failed');
      console.log(`   Exit code: ${result2.code}`);
      if (result2.stderr) console.log(`   Error: ${result2.stderr}`);
    }

    // Test 3: Flattened separate files
    testsTotal++;
    console.log('\n📁 Test 3: Flattened separate files');
    
    const result3 = await runCLI([
      '--base-id', process.env.AIRTABLE_BASE_ID,
      '--format', 'zod',
      '--flatten',
      '--separate-files',
      '--output', 'test-flat-multi'
    ]);

    if (result3.code === 0 && existsSync('./test-flat-multi')) {
      const files = readdirSync('./test-flat-multi');
      const tableFile = files.find(f => f.endsWith('.ts') && f !== 'index.ts');
      
      if (tableFile) {
        const content = readFileSync(join('./test-flat-multi', tableFile), 'utf8');
        const hasRecordId = content.includes('record_id: z.string()');
        const noFieldsWrapper = !content.includes('fields:');
        const hasFlattenedFields = content.match(/\w+: z\./g)?.length > 2; // Should have multiple direct fields
        
        if (hasRecordId && noFieldsWrapper && hasFlattenedFields) {
          testsPassed++;
          console.log('✅ Flattened separate files generation works');
          console.log('   - Files are flattened (no fields wrapper)');
          console.log('   - Contains record_id');
          console.log('   - Multiple direct field properties');
        } else {
          console.log('❌ Flattened separate files generation failed');
          if (!hasRecordId) console.log('   - Missing record_id');
          if (!noFieldsWrapper) console.log('   - Still has fields wrapper');
          if (!hasFlattenedFields) console.log('   - Not enough flattened fields');
        }
      } else {
        console.log('❌ Flattened separate files generation failed');
        console.log('   - No table files found');
      }
    } else {
      console.log('❌ Flattened separate files generation failed');
      console.log(`   Exit code: ${result3.code}`);
      if (result3.stderr) console.log(`   Error: ${result3.stderr}`);
    }

    // Test 4: File naming conventions
    testsTotal++;
    console.log('\n📁 Test 4: File naming conventions');
    
    if (existsSync('./test-ts-multi')) {
      const files = readdirSync('./test-ts-multi').filter(f => f !== 'index.ts');
      const properKebabCase = files.every(f => {
        const nameWithoutExt = f.replace('.ts', '');
        return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);
      });
      
      const noSpaces = files.every(f => !f.includes(' '));
      const noSpecialChars = files.every(f => !/[^a-z0-9.-]/.test(f));
      
      if (properKebabCase && noSpaces && noSpecialChars) {
        testsPassed++;
        console.log('✅ File naming conventions are correct');
        console.log('   - All files use kebab-case');
        console.log('   - No spaces in filenames');
        console.log('   - No special characters');
        console.log(`   - Example files: ${files.slice(0, 3).join(', ')}`);
      } else {
        console.log('❌ File naming conventions are incorrect');
        if (!properKebabCase) console.log('   - Not using proper kebab-case');
        if (!noSpaces) console.log('   - Files contain spaces');
        if (!noSpecialChars) console.log('   - Files contain special characters');
      }
    } else {
      console.log('❌ File naming conventions test failed');
      console.log('   - No directory to analyze');
    }

    // Test 5: Index file re-exports
    testsTotal++;
    console.log('\n📁 Test 5: Index file re-exports functionality');
    
    if (existsSync('./test-zod-multi/index.ts')) {
      const indexContent = readFileSync('./test-zod-multi/index.ts', 'utf8');
      
      const hasReExports = indexContent.includes('export {') && indexContent.includes("from './");
      const hasUtilityTypes = indexContent.includes('AirtableTableName');
      const hasValidationHelpers = indexContent.includes('validateRecord');
      const hasTypeUnions = indexContent.includes(' | ');
      
      if (hasReExports && hasUtilityTypes && hasValidationHelpers && hasTypeUnions) {
        testsPassed++;
        console.log('✅ Index file re-exports work correctly');
        console.log('   - Contains re-exports from table files');
        console.log('   - Includes utility types');
        console.log('   - Includes validation helpers');
        console.log('   - Contains union types');
      } else {
        console.log('❌ Index file re-exports are incomplete');
        if (!hasReExports) console.log('   - Missing re-exports');
        if (!hasUtilityTypes) console.log('   - Missing utility types');
        if (!hasValidationHelpers) console.log('   - Missing validation helpers');
        if (!hasTypeUnions) console.log('   - Missing union types');
      }
    } else {
      console.log('❌ Index file re-exports test failed');
      console.log('   - No index file to analyze');
    }

  } catch (error) {
    console.error('❌ Separate files tests failed with error:', error.message);
  } finally {
    // Cleanup test directories
    cleanupDirectories();
  }

  // Summary
  console.log('\n' + '=' .repeat(45));
  console.log('🏁 Separate Files Tests Summary');
  console.log(`   Tests passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 All separate files tests passed!');
    console.log('   📁 Multi-file generation works correctly');
    console.log('   🏷️  File naming conventions are proper');
    console.log('   📤 Index file re-exports are functional');
    console.log('   🔧 Both TypeScript and Zod formats supported');
    console.log('   🎯 Flattened mode works with separate files');
  } else {
    console.log(`\n⚠️  ${testsTotal - testsPassed} test(s) failed`);
    console.log('   Check the output above for details');
  }
}

// Run the tests
testSeparateFiles().catch(error => {
  console.error('Fatal error in separate files tests:', error);
  process.exit(1);
});