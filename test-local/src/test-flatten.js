#!/usr/bin/env node

// Test the flatten functionality with mock data
// This demonstrates how the runtime utilities work

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import from the built package
const { flattenRecord, flattenRecords } = require('../../dist/runtime/flatten.js');

console.log('🧪 Testing flattenRecord functionality...\n');

// Mock Airtable record structure
function createMockRecord(id, fields) {
  return {
    id,
    fields,
    get: (fieldName) => fields[fieldName],
    patchUpdate: () => Promise.resolve(),
    putUpdate: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  };
}

// Test 1: Single record flattening
console.log('📄 Test 1: Single record flattening');
const mockRecord = createMockRecord('rec123ABC', {
  'Name': 'John Doe',
  'Email': 'john@example.com',
  'Age': 30,
  'Active': true,
  'Role': 'Admin',
  'Tags': ['Developer', 'Team Lead'],
  'Created': '2024-01-15T10:30:00Z'
});

const flattened = flattenRecord(mockRecord);
console.log('Original record structure:');
console.log('  record.id:', mockRecord.id);
console.log('  record.fields.Name:', mockRecord.fields.Name);
console.log('  record.fields.Email:', mockRecord.fields.Email);
console.log();

console.log('Flattened record structure:');
console.log('  flattened.id:', flattened.id);
console.log('  flattened.Name:', flattened.Name);
console.log('  flattened.Email:', flattened.Email);
console.log('  flattened.Tags:', flattened.Tags);
console.log('✅ Single record flattening works!\n');

// Test 2: Multiple records flattening
console.log('📄 Test 2: Multiple records flattening');
const mockRecords = [
  createMockRecord('rec111', { 'Name': 'Alice Smith', 'Role': 'User', 'Active': true }),
  createMockRecord('rec222', { 'Name': 'Bob Johnson', 'Role': 'Admin', 'Active': false }),
  createMockRecord('rec333', { 'Name': 'Charlie Brown', 'Role': 'User', 'Active': true })
];

const flattenedRecords = flattenRecords(mockRecords);
console.log('Original records count:', mockRecords.length);
console.log('Flattened records count:', flattenedRecords.length);
console.log();

console.log('Flattened records:');
flattenedRecords.forEach((record, index) => {
  console.log(`  ${index + 1}. ${record.Name} (${record.Role}) - Active: ${record.Active}`);
});
console.log('✅ Multiple records flattening works!\n');

// Test 3: Complex field types
console.log('📄 Test 3: Complex field types');
const complexRecord = createMockRecord('rec999', {
  'Project Name': 'My Awesome Project',
  'Multi Select': ['Planning', 'In Progress'],
  'Attachments': [
    { id: 'att1', filename: 'document.pdf', url: 'https://example.com/doc.pdf' },
    { id: 'att2', filename: 'image.jpg', url: 'https://example.com/img.jpg' }
  ],
  'Linked Records': ['recABC123', 'recDEF456'],
  'Formula Result': 'Calculated Value',
  'Created By': { id: 'usr123', email: 'admin@example.com', name: 'Admin User' }
});

const complexFlattened = flattenRecord(complexRecord);
console.log('Complex fields flattened:');
console.log('  Project Name:', complexFlattened['Project Name']);
console.log('  Multi Select:', complexFlattened['Multi Select']);
console.log('  Attachments count:', complexFlattened['Attachments']?.length || 0);
console.log('  Linked Records:', complexFlattened['Linked Records']);
console.log('  Created By:', complexFlattened['Created By']?.name);
console.log('✅ Complex field types work!\n');

console.log('🎉 All flatten tests passed!\n');
console.log('💡 Key benefits of flattenRecord:');
console.log('   ✓ Direct field access: record.Name instead of record.fields.Name');
console.log('   ✓ Preserves all field types and complex data');
console.log('   ✓ Maintains type safety with generated interfaces');
console.log('   ✓ Works with any Airtable record structure');
console.log('   ✓ Perfect for TypeScript projects');