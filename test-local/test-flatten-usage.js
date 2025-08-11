// Test d'utilisation du package airtable-types-gen installé
// Ce fichier simule l'utilisation dans un vrai projet

import { flattenRecord, flattenRecords } from '../dist/index.js';

// Simulation d'enregistrements Airtable
const mockRecord = {
  id: 'recXXXXXXXXXXXXXX',
  fields: {
    email: 'john.doe@example.com',
    firstname: 'John',
    lastname: 'Doe',
    user_type: 'Patient',
    auto_id: 123
  },
  createdTime: '2023-01-01T00:00:00.000Z'
};

const mockRecords = [
  mockRecord,
  {
    id: 'recYYYYYYYYYYYYY',
    fields: {
      email: 'jane.smith@example.com',
      firstname: 'Jane',
      lastname: 'Smith',
      user_type: 'Admin',
      auto_id: 124
    },
    createdTime: '2023-01-02T00:00:00.000Z'
  }
];

console.log('🧪 Test des fonctions de flatten...\n');

// Test flattenRecord
console.log('📝 Test flattenRecord:');
const flattened = flattenRecord(mockRecord);
console.log('Record aplati:', {
  record_id: flattened.record_id,
  email: flattened.email,
  firstname: flattened.firstname,
  user_type: flattened.user_type,
  auto_id: flattened.auto_id
});

// Test flattenRecords
console.log('\n📋 Test flattenRecords:');
const flattenedRecords = flattenRecords(mockRecords);
console.log(`Nombre de records aplatis: ${flattenedRecords.length}`);
flattenedRecords.forEach((record, index) => {
  console.log(`Record ${index + 1}:`, {
    record_id: record.record_id,
    email: record.email,
    firstname: record.firstname,
    user_type: record.user_type
  });
});

// Vérification que record_id est correct
console.log('\n✅ Vérifications:');
console.log('Record ID original:', mockRecord.id);
console.log('Record ID aplati:', flattened.record_id);
console.log('Match:', mockRecord.id === flattened.record_id ? '✅' : '❌');

console.log('\n🎉 Tests terminés avec succès!');

export { flattened, flattenedRecords };
