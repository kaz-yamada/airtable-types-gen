// Exemple d'utilisation des deux modes de génération

// ====================================
// MODE NATIF AIRTABLE (sans --flatten)
// ====================================

// Structure native Airtable : {id, fields, createdTime}
import type { UsersRecord as UsersRecordNative, CreateRecord, UpdateRecord } from './generated/native_airtable.js';

// Utilisation avec les APIs Airtable natives
const nativeRecord: UsersRecordNative = {
  id: "recXXXXXXXXXXXXXX",
  fields: {
    email: "john@example.com",
    firstname: "John",
    lastname: "Doe",
    auto_id: 123,
    user_type: "Patient",
    gender: "man"
  },
  createdTime: "2023-01-01T00:00:00.000Z"
};

// Création d'un nouvel enregistrement
const createData: CreateRecord<'Users'> = {
  fields: {
    email: "jane@example.com",
    firstname: "Jane",
    lastname: "Smith",
    user_type: "Admin"
  }
};

// Mise à jour d'un enregistrement existant
const updateData: UpdateRecord<'Users'> = {
  id: "recXXXXXXXXXXXXXX",
  fields: {
    email: "jane.smith@example.com"
  }
};

// ====================================
// MODE FLATTEN (avec --flatten)
// ====================================

// Structure aplatie : tous les champs à la racine avec record_id
import type { 
  UsersRecord as UsersRecordFlattened, 
  CreateRecord as CreateRecordFlat,
  UpdateRecord as UpdateRecordFlat,
  flattenRecord 
} from './generated/flattened_fixed.js';

// Utilisation avec la structure aplatie
const flattenedRecord: UsersRecordFlattened = {
  record_id: "recXXXXXXXXXXXXXX",
  email: "john@example.com",
  firstname: "John", 
  lastname: "Doe",
  auto_id: 123,  // Le champ 'id' auto-number est renommé 'auto_id'
  user_type: "Patient",
  gender: "man"
};

// Création d'un nouvel enregistrement (flatten)
const createDataFlat: CreateRecordFlat<'Users'> = {
  email: "jane@example.com",
  firstname: "Jane",
  lastname: "Smith", 
  user_type: "Admin"
  // record_id ne doit pas être fourni lors de la création
};

// Mise à jour d'un enregistrement existant (flatten)
const updateDataFlat: UpdateRecordFlat<'Users'> = {
  record_id: "recXXXXXXXXXXXXXX",
  email: "jane.smith@example.com"
};

// Utilisation de l'utilitaire flatten pour convertir
// d'un enregistrement natif vers un enregistrement aplati
const flattened = flattenRecord(nativeRecord);
console.log(flattened.record_id); // "recXXXXXXXXXXXXXX" 
console.log(flattened.email);     // "john@example.com"
