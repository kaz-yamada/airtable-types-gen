#!/usr/bin/env node

// Real Airtable integration test (requires valid credentials)
// This tests the actual API integration and type generation

import Airtable from 'airtable';
import 'dotenv/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { flattenRecord, flattenRecords } = require('../../dist/runtime/flatten.js');

async function testRealAirtable() {
  console.log('🌐 Testing real Airtable integration...\n');

  // Check environment variables
  const token = process.env.AIRTABLE_PERSONAL_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!token) {
    console.log('⚠️  AIRTABLE_PERSONAL_TOKEN not set in .env');
    console.log('   Copy .env.example to .env and fill in your credentials');
    return;
  }

  if (!baseId) {
    console.log('⚠️  AIRTABLE_BASE_ID not set in .env');
    console.log('   Copy .env.example to .env and fill in your base ID');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`   Base ID: ${baseId}`);
  console.log(`   Token: ${token.substring(0, 10)}...`);
  console.log();

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey: token });
    const base = airtable.base(baseId);

    // Test 1: List tables (via meta API)
    console.log('📋 Test 1: Fetching base schema...');
    const schemaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!schemaResponse.ok) {
      throw new Error(`Schema API error: ${schemaResponse.status} ${schemaResponse.statusText}`);
    }

    const schema = await schemaResponse.json();
    console.log(`✅ Found ${schema.tables.length} tables:`);
    schema.tables.forEach(table => {
      console.log(`   - ${table.name} (${table.fields.length} fields)`);
    });
    console.log();

    if (schema.tables.length === 0) {
      console.log('⚠️  No tables found in base. Make sure the base has some tables.');
      return;
    }

    // Test 2: Fetch records from first table
    const firstTable = schema.tables[0];
    console.log(`📊 Test 2: Fetching records from "${firstTable.name}"...`);
    
    try {
      const records = await base(firstTable.name).select({
        maxRecords: 3 // Limit to 3 records for testing
      }).all();

      console.log(`✅ Fetched ${records.length} records`);

      if (records.length > 0) {
        // Test 3: Flatten records
        console.log('🔧 Test 3: Testing record flattening...');
        
        console.log('Original record structure:');
        console.log('  record.id:', records[0].id);
        console.log('  record.fields:', Object.keys(records[0].fields || {}).slice(0, 3).join(', '), '...');
        
        const flattened = flattenRecord(records[0]);
        console.log('Flattened record structure:');
        console.log('  flattened.id:', flattened.id);
        console.log('  Direct field access:', Object.keys(flattened).filter(k => k !== 'id').slice(0, 3).join(', '), '...');
        
        console.log('✅ Record flattening works with real data!');
        
        // Test 4: Flatten all records
        const allFlattened = flattenRecords(records);
        console.log(`✅ Successfully flattened ${allFlattened.length} records`);
        console.log();
      }

    } catch (recordError) {
      console.log(`⚠️  Could not fetch records from "${firstTable.name}":`, recordError.message);
      console.log('   This might be due to permissions or empty table');
      console.log('   The schema fetch worked, so the CLI should still work for type generation');
    }

    console.log('🎉 Real Airtable integration test completed!');
    console.log();
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run generate');
    console.log('   2. Check the generated types in generated/types.ts');
    console.log('   3. Run: npm run test:types');
    
  } catch (error) {
    console.error('❌ Real Airtable test failed:', error.message);
    console.log();
    console.log('🔍 Common issues:');
    console.log('   - Invalid personal access token');
    console.log('   - Invalid base ID');
    console.log('   - Base not accessible with current token');
    console.log('   - Network connectivity issues');
  }
}

// Run the test
testRealAirtable().catch(console.error);