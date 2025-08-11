// Test d'import depuis le subpath './runtime'
import { flattenRecord, flattenRecords } from '../dist/runtime/index.js';

console.log('🧪 Test import depuis ./runtime...\n');

const mockRecord = {
  id: 'recTEST123456789',
  fields: {
    name: 'Test User',
    email: 'test@example.com'
  },
  createdTime: '2023-01-01T00:00:00.000Z'
};

const flattened = flattenRecord(mockRecord);
console.log('✅ Import depuis ./runtime fonctionne !');
console.log('Record aplati:', flattened);

export { flattened };
