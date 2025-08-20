# Test Local Environment

Ce dossier vous permet de tester le package `airtable-types-gen` en local avant publication.

## Configuration

1. **Copiez le fichier d'environnement :**

   ```bash
   cp .env.example .env
   ```

2. **Remplissez vos credentials Airtable dans `.env` :**
   - `AIRTABLE_PERSONAL_TOKEN` : Votre token personnel Airtable
   - `AIRTABLE_BASE_ID` : L'ID de votre base Airtable de test

3. **Installez les dépendances :**

   ```bash
   npm install
   ```

## Tests Disponibles

### Tests Basiques (sans credentials)

```bash
# Test des fonctions CLI de base (help, version)
npm run test:basic

# Test des fonctions de flatten avec des données mock
npm run test:flatten

# Test de la compilation TypeScript
npm run test:types
```

### Tests avec Airtable Réel (nécessite credentials)

```bash
# Test d'intégration avec une vraie base Airtable
node src/test-real-airtable.js

# Tests des nouvelles fonctionnalités Zod
npm run test:zod

# Tests de génération multi-fichiers
npm run test:multi

# Génération de types standard
npm run generate

# Génération avec support flatten
npm run generate:flatten

# Test complet : génération + validation
npm run dev
```

### Génération Avancée

```bash
# Génération de schémas Zod
npm run generate:zod

# Génération Zod avec flatten
npm run generate:zod-flat

# Génération TypeScript multi-fichiers
npm run generate:multi-ts

# Génération Zod multi-fichiers
npm run generate:multi-zod
```

### Démonstrations

```bash
# Démonstration des schémas Zod
npm run demo:zod

# Démonstration de la génération multi-fichiers
npm run demo:multi
```

## Structure des Tests

### 1. `test-basic.js`

- Teste les commandes CLI (`--help`, `--version`)
- Valide la gestion d'erreurs
- Aucun credential requis

### 2. `test-flatten.js`

- Teste `flattenRecord()` et `flattenRecords()`
- Utilise des données mock
- Démontre les avantages du flattening

### 3. `test-zod-format.js` 🆕

- Teste la génération de schémas Zod
- Valide les patterns de validation (email, URL, dates)
- Teste le mode flatten avec Zod
- Nécessite des credentials Airtable

### 4. `test-separate-files.js` 🆕

- Teste la génération multi-fichiers
- Valide la structure TypeScript et Zod
- Vérifie les conventions de nommage
- Teste l'index de re-export

### 5. `test-types.ts`

- Valide la sécurité des types générés
- Teste les types `CreateRecord`, `UpdateRecord`
- Vérifie les champs readonly/optionnels

### 6. `test-real-airtable.js`

- Intégration complète avec Airtable
- Teste l'API Meta et les records
- Valide le workflow complet

### Exemples et Démonstrations

### 7. `example-zod-usage.js` 🆕

- Démonstration complète des schémas Zod
- Exemples d'usage avec validation
- Patterns d'intégration avec Airtable

### 8. `example-multi-file-usage.js` 🆕

- Guide d'utilisation des fichiers séparés
- Comparaison fichier unique vs multi-fichiers
- Bonnes pratiques d'organisation

## Workflow de Test Recommandé

### Étape 1 : Tests de Base

```bash
npm run test:basic
npm run test:flatten
```

### Étape 2 : Configuration Airtable

```bash
# Créer .env avec vos credentials
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Étape 3 : Test d'Intégration

```bash
node src/test-real-airtable.js
```

### Étape 4 : Génération et Validation

```bash
npm run generate
npm run test:types
```

## Dossiers Générés

```
generated/
├── types.ts              # Types TypeScript standard
├── types-flat.ts         # Types TypeScript avec flatten
├── zod-schemas.ts        # Schémas Zod en fichier unique
├── zod-schemas-flat.ts   # Schémas Zod flatten en fichier unique
├── types/                # Types TypeScript par fichier
│   ├── index.ts
│   ├── users.ts
│   └── projects.ts
└── schemas/              # Schémas Zod par fichier
    ├── index.ts
    ├── users.ts
    └── projects.ts
```

## Exemples d'Usage

### TypeScript Standard

```typescript
import type { YourTableRecord, CreateRecord } from './generated/types';
import { flattenRecord } from 'airtable-types-gen';

// Utilisation type-safe
const newRecord: CreateRecord<'YourTable'> = {
  Name: 'Test',
  // Autres champs...
};

// Flattening des records
const record = await base('YourTable').find('recXXX');
const flattened = flattenRecord(record);
console.log(flattened.Name); // Accès direct
```

### Schémas Zod

```typescript
import { UsersSchema, type Users } from './generated/schemas/users';
import { validateRecord } from './generated/schemas';

// Validation avec Zod
try {
  const user: Users = UsersSchema.parse(rawData);
  console.log('Utilisateur validé:', user.fields.Name);
} catch (error) {
  console.error('Données invalides:', error.errors);
}

// Validation safe
const result = UsersSchema.safeParse(rawData);
if (result.success) {
  const user = result.data;
  // Utilisation type-safe
}
```

### Multi-fichiers

```typescript
// Import spécifique
import type { UsersRecord } from './generated/types/users';
import { UsersSchema } from './generated/schemas/users';

// Import via index
import { 
  type UsersRecord,
  type ProjectsRecord,
  UsersSchema,
  ProjectsSchema 
} from './generated/schemas';
```

## Résolution de Problèmes

### Erreur "Base ID is required"

- Vérifiez que `AIRTABLE_BASE_ID` est défini dans `.env`
- Format attendu : `appXXXXXXXXXX`

### Erreur "Personal token is required"

- Vérifiez que `AIRTABLE_PERSONAL_TOKEN` est défini dans `.env`
- Obtenez un token depuis [Airtable Developer Hub](https://airtable.com/developers/web/api/introduction)

### Erreur de permissions

- Vérifiez que le token a accès à la base
- Vérifiez les permissions de lecture sur les tables

### Types non générés

- Vérifiez que la base contient des tables
- Vérifiez la connectivité réseau
- Consultez les logs pour plus de détails

### Erreurs Zod ou multi-fichiers

- Vérifiez que la dépendance `zod` est installée
- Assurez-vous que le dossier de sortie existe
- Vérifiez les permissions d'écriture

### Tests échouent

- Exécutez `npm run build` dans le dossier parent
- Vérifiez que les credentials sont corrects
- Testez d'abord avec une base simple

## Nouvelles Fonctionnalités 🆕

### Format Zod

Le générateur peut maintenant produire des schémas Zod avec validation runtime :

- Validation des emails, URLs, dates
- Messages d'erreur personnalisés
- Types TypeScript inférés automatiquement
- Utilitaires de validation inclus

### Fichiers Séparés

Générez un fichier par table pour une meilleure organisation :

- Meilleure lisibilité du code
- Imports sélectifs (performance)
- Maintenance simplifiée
- Compatible bundlers modernes

### Commandes Étendues

```bash
# Toutes les nouvelles options
airtable-types-gen --format zod --separate-files --flatten --output ./schemas/
```

## Support

Si vous rencontrez des problèmes :

1. Vérifiez que le build principal fonctionne : `cd .. && npm run build`
2. Consultez les logs d'erreur détaillés
3. Testez avec une base Airtable simple d'abord
4. Vérifiez la documentation Airtable pour les formats d'ID
