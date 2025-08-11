// Example d'utilisation des fonctions de flatten depuis le package installé

// ==============================
// IMPORTS POSSIBLES
// ==============================

// Option 1: Import depuis le root du package (recommandé)
import { flattenRecord, flattenRecords, type FlattenedRecord } from 'airtable-types-gen';

// Option 2: Import depuis le subpath ./runtime
import { flattenRecord as flattenFromRuntime, flattenRecords as flattenRecordsFromRuntime } from 'airtable-types-gen/runtime';

// ==============================
// UTILISATION AVEC AIRTABLE
// ==============================

// Supposons que vous avez une instance Airtable configurée
// const base = require('airtable').base('appXXXXXXXXXXXXXX');

async function exempleUtilisation() {
  // Récupération d'un seul enregistrement
  // const record = await base('Users').find('recXXXXXXXXXXXXXX');
  
  // Simulation d'un enregistrement Airtable
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

  // ==============================
  // FLATTEN D'UN SEUL RECORD
  // ==============================
  
  const flattened: FlattenedRecord = flattenRecord(mockRecord as any);
  
  console.log('Record aplati:');
  console.log('ID Airtable:', flattened.record_id); // 'recXXXXXXXXXXXXXX'
  console.log('Email:', flattened.email);           // 'john.doe@example.com'
  console.log('Prénom:', flattened.firstname);      // 'John'
  console.log('Type:', flattened.user_type);        // 'Patient'
  console.log('Auto ID:', flattened.auto_id);       // 123

  // ==============================
  // FLATTEN DE PLUSIEURS RECORDS
  // ==============================
  
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

  const flattenedRecords: FlattenedRecord[] = flattenRecords(mockRecords as any);
  
  console.log('\nRecords aplatis:');
  flattenedRecords.forEach((record, index) => {
    console.log(`Record ${index + 1}:`, {
      record_id: record.record_id,
      email: record.email,
      firstname: record.firstname,
      user_type: record.user_type
    });
  });

  // ==============================
  // UTILISATION AVEC LES TYPES GÉNÉRÉS
  // ==============================
  
  // Si vous avez généré vos types avec --flatten, vous pouvez les utiliser directement:
  // import type { UsersRecord } from './generated/flattened_types';
  // const typedFlattened: UsersRecord = flattenRecord(record);

  return flattened;
}

// ==============================
// UTILISATION EN CONDITIONS RÉELLES
// ==============================

/*
// Exemple avec une vraie instance Airtable:

import Airtable from 'airtable';
import { flattenRecord, flattenRecords } from 'airtable-types-gen';
import type { UsersRecord } from './generated/native_types'; // Types générés en mode natif

const base = new Airtable({apiKey: 'your-api-key'}).base('your-base-id');

async function realUsage() {
  // Récupérer tous les utilisateurs
  const records = await base('Users').select().all();
  
  // Les aplatir pour plus de simplicité d'utilisation
  const flattenedUsers = flattenRecords(records);
  
  // Maintenant vous pouvez utiliser les données aplaties
  flattenedUsers.forEach(user => {
    console.log(`User: ${user.firstname} ${user.lastname} (${user.email})`);
    console.log(`ID Airtable: ${user.record_id}`);
    console.log(`Auto ID: ${user.auto_id}`);
  });
  
  // Ou récupérer un seul enregistrement
  const singleRecord = await base('Users').find('recXXXXXXXXXXXXXX');
  const flattenedUser = flattenRecord(singleRecord);
  
  return flattenedUser;
}
*/

// Exporter pour utilisation
export { exempleUtilisation };

if (require.main === module) {
  exempleUtilisation().catch(console.error);
}
