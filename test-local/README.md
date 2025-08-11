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

# Génération de types standard
npm run generate

# Génération avec support flatten
npm run generate:flatten

# Test complet : génération + validation
npm run dev
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

### 3. `test-types.ts`
- Valide la sécurité des types générés
- Teste les types `CreateRecord`, `UpdateRecord`
- Vérife les champs readonly/optionnels

### 4. `test-real-airtable.js`
- Intégration complète avec Airtable
- Teste l'API Meta et les records
- Valide le workflow complet

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

- `generated/types.ts` : Types générés standard
- `generated/types-flat.ts` : Types avec support flatten

## Exemple d'Usage

Après génération des types, vous pouvez les utiliser ainsi :

```typescript
import type { YourTableRecord, CreateRecord } from './generated/types';
import { flattenRecord } from 'airtable-types-gen';

// Utilisation type-safe
const newRecord: CreateRecord<'YourTable'> = {
  Name: "Test",
  // Autres champs...
};

// Flattening des records
const record = await base('YourTable').find('recXXX');
const flattened = flattenRecord(record);
console.log(flattened.Name); // Accès direct
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

## Support

Si vous rencontrez des problèmes :

1. Vérifiez que le build principal fonctionne : `cd .. && npm run build`
2. Consultez les logs d'erreur détaillés
3. Testez avec une base Airtable simple d'abord
4. Vérifiez la documentation Airtable pour les formats d'ID