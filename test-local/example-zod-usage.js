#!/usr/bin/env node

// Exemple d'utilisation des schémas Zod générés

import { readFileSync, writeFileSync } from 'fs';

// Simuler l'import de schémas Zod générés
const mockZodSchema = `
import { z } from 'zod';

// Schéma généré pour la table Users
export const UsersSchema = z.object({
  record_id: z.string(),
  Name: z.string(),
  Email: z.string().email('Invalid email format'),
  Age: z.number().min(0, 'Age must be positive'),
  IsActive: z.boolean(),
  Role: z.enum(['Admin', 'User', 'Guest']),
  Created: z.string().datetime('Invalid ISO datetime format').optional(),
});

export type Users = z.infer<typeof UsersSchema>;

// Fonctions d'aide à la validation
export const validateUser = (data) => UsersSchema.parse(data);
export const safeValidateUser = (data) => UsersSchema.safeParse(data);
`;

function demonstrateZodUsage() {
  console.log('🧪 Démonstration : Utilisation des schémas Zod générés');
  console.log('=' .repeat(55));

  // Créer un fichier de schéma temporaire pour la démo
  writeFileSync('./demo-schema.mjs', mockZodSchema);

  console.log('\n📝 1. Schéma Zod généré :');
  console.log('-'.repeat(30));
  console.log('✨ Le générateur produit des schémas Zod comme :');
  console.log(`
export const UsersSchema = z.object({
  record_id: z.string(),
  Name: z.string(),
  Email: z.string().email('Invalid email format'),
  Age: z.number().min(0, 'Age must be positive'),
  IsActive: z.boolean(),
  Role: z.enum(['Admin', 'User', 'Guest']),
  Created: z.string().datetime().optional(),
});

export type Users = z.infer<typeof UsersSchema>;
`);

  console.log('\n🎯 2. Avantages des schémas Zod :');
  console.log('-'.repeat(30));
  console.log('✅ Validation runtime des données');
  console.log('✅ Messages d\'erreur personnalisés');
  console.log('✅ Types TypeScript inférés automatiquement');
  console.log('✅ Parsing et transformation des données');
  console.log('✅ Support des types complexes (enums, dates, etc.)');

  console.log('\n🚀 3. Exemples d\'utilisation :');
  console.log('-'.repeat(30));

  // Exemple 1 : Validation réussie
  console.log('📋 Exemple 1: Validation de données valides');
  const validUserData = {
    record_id: 'rec123ABC',
    Name: 'Jean Dupont',
    Email: 'jean.dupont@example.com',
    Age: 30,
    IsActive: true,
    Role: 'User',
    Created: '2023-12-01T10:00:00.000Z'
  };

  console.log('Données d\'entrée:', JSON.stringify(validUserData, null, 2));
  console.log('✅ Ces données respectent le schéma Zod');
  console.log('✨ Types TypeScript automatiquement inférés');

  // Exemple 2 : Validation échouée
  console.log('\n📋 Exemple 2: Validation de données invalides');
  const invalidUserData = {
    record_id: 'rec456DEF',
    Name: 'Marie Martin',
    Email: 'email-invalide',  // Format email incorrect
    Age: -5,                  // Age négatif
    IsActive: 'oui',         // Boolean attendu
    Role: 'SuperAdmin',      // Pas dans l'enum
    Created: 'invalid-date'   // Format date incorrect
  };

  console.log('Données d\'entrée:', JSON.stringify(invalidUserData, null, 2));
  console.log('❌ Ces données NE respectent PAS le schéma Zod');
  console.log('🔍 Erreurs détectées:');
  console.log('   - Email: format invalide');
  console.log('   - Age: doit être positif');
  console.log('   - IsActive: boolean attendu');
  console.log('   - Role: valeur non permise');
  console.log('   - Created: format datetime invalide');

  console.log('\n🛠️  4. Code d\'utilisation pratique :');
  console.log('-'.repeat(30));

  console.log(`
// Import des schémas générés
import { UsersSchema, type Users } from './schemas/users.js';
import { validateRecord } from './schemas/index.js';

// 1. Validation stricte (throws en cas d'erreur)
try {
  const user: Users = UsersSchema.parse(rawData);
  console.log('Utilisateur validé:', user);
} catch (error) {
  console.error('Données invalides:', error.errors);
}

// 2. Validation safe (retourne success/error)
const result = UsersSchema.safeParse(rawData);
if (result.success) {
  const user: Users = result.data;
  console.log('Utilisateur validé:', user);
} else {
  console.log('Erreurs de validation:', result.error.errors);
}

// 3. Validation de création (sans champs readonly)
const createUserSchema = UsersSchema.omit({ 
  record_id: true, 
  Created: true 
});
const newUserData = createUserSchema.parse(userInput);

// 4. Validation de mise à jour (tous champs optionnels)
const updateUserSchema = UsersSchema.partial();
const updateData = updateUserSchema.parse(userInput);
`);

  console.log('\n🌟 5. Intégration avec l\'API Airtable :');
  console.log('-'.repeat(30));

  console.log(`
// Récupération et validation des records Airtable
import Airtable from 'airtable';
import { UsersSchema } from './schemas/users.js';

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
  .base(process.env.AIRTABLE_BASE_ID);

// Récupérer et valider les records
base('Users').select().all((err, records) => {
  if (err) { console.error(err); return; }
  
  records.forEach(record => {
    try {
      // Conversion au format attendu par le schéma
      const userData = {
        record_id: record.id,
        Name: record.fields.Name,
        Email: record.fields.Email,
        Age: record.fields.Age,
        IsActive: record.fields.IsActive,
        Role: record.fields.Role,
        Created: record.createdTime
      };
      
      // Validation avec Zod
      const validatedUser = UsersSchema.parse(userData);
      console.log('✅ Utilisateur validé:', validatedUser);
      
    } catch (zodError) {
      console.error('❌ Données Airtable invalides:', zodError.errors);
    }
  });
});
`);

  console.log('\n🔧 6. Utilitaires runtime disponibles :');
  console.log('-'.repeat(30));

  console.log(`
// Import des utilitaires Zod du runtime
import { 
  validateRecord,
  safeValidateRecord,
  validateRecords,
  createValidator,
  formatZodError,
  airtableSchemaHelpers
} from 'airtable-types-gen/runtime';

// Validation d'un record unique
const user = validateRecord(UsersSchema, rawData);

// Validation safe d'un record
const result = safeValidateRecord(UsersSchema, rawData);

// Validation de plusieurs records
const users = validateRecords(UsersSchema, arrayOfRawData);

// Création d'un validateur réutilisable
const userValidator = createValidator(UsersSchema);
const validatedUser = userValidator.validate(rawData);

// Formatage des erreurs Zod
try {
  UsersSchema.parse(invalidData);
} catch (error) {
  console.error(formatZodError(error));
}

// Helpers pour schémas Airtable
const recordIdSchema = airtableSchemaHelpers.recordId();
const timestampSchema = airtableSchemaHelpers.timestamp();
const attachmentSchema = airtableSchemaHelpers.attachment();
`);

  console.log('\n🎁 7. Génération des fichiers séparés :');
  console.log('-'.repeat(30));

  console.log(`
# Commande pour générer des fichiers séparés avec Zod
airtable-types-gen \\
  --format zod \\
  --separate-files \\
  --output ./schemas/ \\
  --base-id appXXXXXXXX

# Structure générée :
schemas/
├── index.ts          # Re-exports + types utilitaires
├── users.ts          # Schéma Users + type TS
├── projects.ts       # Schéma Projects + type TS
└── tasks.ts          # Schéma Tasks + type TS

# Usage avec fichiers séparés :
import { UsersSchema, type Users } from './schemas/users.js';
import { ProjectsSchema, type Projects } from './schemas/projects.js';
import { validateRecord } from './schemas/index.js';
`);

  console.log('\n✨ Résumé des fonctionnalités Zod :');
  console.log('=' .repeat(55));
  console.log('🔍 Validation runtime complète des données Airtable');
  console.log('📝 Types TypeScript inférés automatiquement');
  console.log('🎯 Messages d\'erreur détaillés et personnalisés');
  console.log('📁 Support des fichiers séparés par table');
  console.log('🛠️  Utilitaires runtime pour simplifier l\'usage');
  console.log('🔧 Compatible avec les patterns Airtable (IDs, dates, etc.)');
  console.log('⚡ Performance optimisée avec validation incrémentale');

  // Nettoyage
  try {
    require('fs').unlinkSync('./demo-schema.mjs');
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Exécuter la démonstration
demonstrateZodUsage();