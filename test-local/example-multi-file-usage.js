#!/usr/bin/env node

// Exemple d'utilisation de la génération multi-fichiers

function demonstrateMultiFileUsage() {
  console.log('🗂️  Démonstration : Génération Multi-Fichiers');
  console.log('=' .repeat(50));

  console.log('\n🎯 1. Pourquoi utiliser des fichiers séparés ?');
  console.log('-'.repeat(40));
  console.log('✅ Organisation claire : un fichier par table');
  console.log('✅ Imports sélectifs : importez seulement ce dont vous avez besoin');
  console.log('✅ Lisibilité améliorée : fichiers plus petits et focalisés');
  console.log('✅ Maintenance simplifiée : modifications isolées par table');
  console.log('✅ Performance : bundling optimal avec tree-shaking');
  console.log('✅ Collaboration : moins de conflits git sur les types');

  console.log('\n🚀 2. Commandes de génération :');
  console.log('-'.repeat(40));

  console.log('\n📝 TypeScript avec fichiers séparés :');
  console.log(`
# Génération TypeScript multi-fichiers
airtable-types-gen \\
  --format typescript \\
  --separate-files \\
  --output ./types/ \\
  --base-id appXXXXXXXX

# Génération TypeScript multi-fichiers avec flatten
airtable-types-gen \\
  --format typescript \\
  --separate-files \\
  --flatten \\
  --output ./types-flat/ \\
  --base-id appXXXXXXXX
`);

  console.log('\n🔧 Zod avec fichiers séparés :');
  console.log(`
# Génération Zod multi-fichiers
airtable-types-gen \\
  --format zod \\
  --separate-files \\
  --output ./schemas/ \\
  --base-id appXXXXXXXX

# Génération Zod multi-fichiers avec flatten
airtable-types-gen \\
  --format zod \\
  --separate-files \\
  --flatten \\
  --output ./schemas-flat/ \\
  --base-id appXXXXXXXX
`);

  console.log('\n📁 3. Structure générée - TypeScript :');
  console.log('-'.repeat(40));

  console.log(`
types/
├── index.ts              # Re-exports + types utilitaires
├── users.ts              # Interface UsersRecord
├── projects.ts           # Interface ProjectsRecord
├── tasks.ts              # Interface TasksRecord
├── contacts.ts           # Interface ContactsRecord
└── invoices.ts           # Interface InvoicesRecord

# Contenu d'un fichier table (users.ts) :
/**
 * Interface generated for table "Users"
 * @description User records from CRM
 */
interface UsersRecordFields {
  /** User's full name */
  Name: string;
  
  /** Valid email address */
  Email: string;
  
  /** User age */
  Age?: number;
  
  /** Account status */
  IsActive: boolean;
  
  /** 🔒 Computed by Airtable - readonly ISO datetime string */
  readonly Created?: string;
}

export interface UsersRecord {
  /** Unique Airtable record ID */
  id: string;
  
  /** Record fields */
  fields: UsersRecordFields;
  
  /** Record creation time */
  createdTime: string;
}

# Contenu de l'index (index.ts) :
// Auto-generated index file - do not modify manually
// Re-exports all table types

export type { UsersRecord } from './users.js';
export type { ProjectsRecord } from './projects.js';
export type { TasksRecord } from './tasks.js';

// Utility types
export type AirtableTableName = 'Users' | 'Projects' | 'Tasks';

export interface AirtableTableTypes {
  'Users': UsersRecord;
  'Projects': ProjectsRecord;
  'Tasks': TasksRecord;
}

export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];
`);

  console.log('\n🔧 4. Structure générée - Zod :');
  console.log('-'.repeat(40));

  console.log(`
schemas/
├── index.ts              # Re-exports + utilitaires Zod
├── users.ts              # UsersSchema + Users type
├── projects.ts           # ProjectsSchema + Projects type
├── tasks.ts              # TasksSchema + Tasks type
├── contacts.ts           # ContactsSchema + Contacts type
└── invoices.ts           # InvoicesSchema + Invoices type

# Contenu d'un fichier table (users.ts) :
import { z } from 'zod';

/**
 * Zod schema for table "Users"
 * @description User records from CRM
 */
const UsersSchemaFields = z.object({
  /** User's full name */
  Name: z.string(),
  
  /** Valid email address */
  Email: z.string().email('Invalid email format'),
  
  /** User age */
  Age: z.number().min(0, 'Age must be positive').optional(),
  
  /** Account status */
  IsActive: z.boolean(),
  
  /** 🔒 Computed by Airtable - readonly ISO datetime string */
  Created: z.string().datetime('Invalid ISO datetime format').optional(),
});

export const UsersSchema = z.object({
  /** Unique Airtable record ID */
  id: z.string(),
  
  /** Record fields */
  fields: UsersSchemaFields,
  
  /** Record creation time */
  createdTime: z.string().datetime(),
});

/**
 * Inferred TypeScript type for Users
 */
export type Users = z.infer<typeof UsersSchema>;

# Contenu de l'index (index.ts) :
// Auto-generated index file - do not modify manually
// Re-exports all table schemas/types

export { UsersSchema, type Users } from './users.js';
export { ProjectsSchema, type Projects } from './projects.js';
export { TasksSchema, type Tasks } from './tasks.js';

// Utility types for Zod schemas
export type AirtableTableName = 'Users' | 'Projects' | 'Tasks';

export interface AirtableTableSchemas {
  'Users': { schema: UsersSchema, type: Users };
  'Projects': { schema: ProjectsSchema, type: Projects };
  'Tasks': { schema: TasksSchema, type: Tasks };
}

export const validateRecord = <T extends AirtableTableName>(
  tableName: T,
  data: unknown
): AirtableTableSchemas[T]['type'] => {
  // Validation logic here
};
`);

  console.log('\n💡 5. Exemples d\'usage - TypeScript :');
  console.log('-'.repeat(40));

  console.log(`
// Import spécifique d'une seule table
import type { UsersRecord } from './types/users.js';

// Import de plusieurs tables
import type { 
  UsersRecord,
  ProjectsRecord 
} from './types/index.js';

// Import des types utilitaires
import type { 
  AirtableTableName,
  GetTableRecord 
} from './types/index.js';

// Usage avec types génériques
function processUser(user: UsersRecord) {
  console.log(\`Processing user: \${user.fields.Name}\`);
  console.log(\`Email: \${user.fields.Email}\`);
  console.log(\`Active: \${user.fields.IsActive}\`);
}

// Usage avec types utilitaires
function processRecord<T extends AirtableTableName>(
  tableName: T,
  record: GetTableRecord<T>
) {
  console.log(\`Processing \${tableName} record: \${record.id}\`);
  return record;
}

// Type-safe avec intellisense complet
const user: UsersRecord = {
  id: 'rec123',
  fields: {
    Name: 'Jean Dupont',
    Email: 'jean@example.com',
    IsActive: true
  },
  createdTime: '2023-12-01T10:00:00.000Z'
};
`);

  console.log('\n🔧 6. Exemples d\'usage - Zod :');
  console.log('-'.repeat(40));

  console.log(`
// Import spécifique d'un schéma
import { UsersSchema, type Users } from './schemas/users.js';

// Import de plusieurs schémas
import { 
  UsersSchema,
  ProjectsSchema,
  type Users,
  type Projects
} from './schemas/index.js';

// Import des utilitaires de validation
import { validateRecord } from './schemas/index.js';

// Validation d'un record utilisateur
function validateAndProcessUser(rawData: unknown): Users | null {
  try {
    const user = UsersSchema.parse(rawData);
    console.log('✅ Utilisateur validé:', user.fields.Name);
    return user;
  } catch (error) {
    console.error('❌ Données invalides:', error.errors);
    return null;
  }
}

// Validation safe avec gestion d'erreur
function safeValidateUser(rawData: unknown) {
  const result = UsersSchema.safeParse(rawData);
  
  if (result.success) {
    const user: Users = result.data;
    console.log('Utilisateur:', user.fields.Name);
    return user;
  } else {
    console.log('Erreurs:', result.error.issues);
    return null;
  }
}

// Validation de création (sans champs readonly)
import { UsersSchema } from './schemas/users.js';

const CreateUserSchema = UsersSchema.omit({
  id: true,
  createdTime: true
}).extend({
  fields: UsersSchema.shape.fields.omit({
    Created: true // Champ computed/readonly
  })
});

function createUser(userData: unknown) {
  const validData = CreateUserSchema.parse(userData);
  
  // Appel API Airtable pour créer l'utilisateur
  return base('Users').create([{
    fields: validData.fields
  }]);
}
`);

  console.log('\n⚡ 7. Avantages de performance :');
  console.log('-'.repeat(40));

  console.log(`
// ❌ Problème avec un seul gros fichier :
import { 
  UsersRecord,      // Charge TOUT le fichier
  ProjectsRecord,   // même si on n'utilise qu'une table
  TasksRecord,
  // ... 50 autres tables
} from './big-types-file.js';

// ✅ Solution avec fichiers séparés :
import type { UsersRecord } from './types/users.js';     // Charge seulement Users
import type { ProjectsRecord } from './types/projects.js'; // Charge seulement Projects

// ✨ Bundler moderne (Webpack, Vite, etc.) :
// - Tree-shaking optimal
// - Code splitting automatique
// - Imports paresseux possibles
// - Cache plus efficace
`);

  console.log('\n🔄 8. Migration depuis un fichier unique :');
  console.log('-'.repeat(40));

  console.log(`
// Avant (fichier unique) :
import type { 
  UsersRecord,
  ProjectsRecord,
  TasksRecord
} from './types.js';

// Après (fichiers séparés) :
import type { UsersRecord } from './types/users.js';
import type { ProjectsRecord } from './types/projects.js';
import type { TasksRecord } from './types/tasks.js';

// Ou via l'index pour compatibilité :
import type { 
  UsersRecord,
  ProjectsRecord,
  TasksRecord
} from './types/index.js';  // Fonctionne comme avant !
`);

  console.log('\n🛠️  9. Conventions et bonnes pratiques :');
  console.log('-'.repeat(40));

  console.log(`
📝 Nommage des fichiers :
- "User Profiles" → user-profiles.ts
- "Project Tasks" → project-tasks.ts  
- "2023 Reports" → 2023-reports.ts
- "API Keys" → api-keys.ts

📁 Organisation recommandée :
project/
├── src/
│   ├── types/          # Types TypeScript générés
│   │   ├── index.ts
│   │   ├── users.ts
│   │   └── projects.ts
│   │
│   ├── schemas/        # Schémas Zod générés
│   │   ├── index.ts
│   │   ├── users.ts
│   │   └── projects.ts
│   │
│   └── api/           # Logique métier
│       ├── users.ts   # Utilise ./types/users.js
│       └── projects.ts

🔧 Scripts package.json :
{
  "scripts": {
    "generate:types": "airtable-types-gen --separate-files --output src/types/",
    "generate:schemas": "airtable-types-gen --format zod --separate-files --output src/schemas/",
    "generate:all": "npm run generate:types && npm run generate:schemas"
  }
}
`);

  console.log('\n✨ Résumé des avantages multi-fichiers :');
  console.log('=' .repeat(50));
  console.log('📦 Meilleure organisation du code');
  console.log('⚡ Performance optimisée (imports sélectifs)');
  console.log('🔧 Maintenance simplifiée (modifications isolées)');
  console.log('👥 Collaboration améliorée (moins de conflits)');
  console.log('📱 Compatible avec les bundlers modernes');
  console.log('🎯 IntelliSense plus précis et rapide');
  console.log('🔄 Migration progressive possible');
  console.log('📝 Fichiers plus lisibles et focalisés');
}

// Exécuter la démonstration
demonstrateMultiFileUsage();