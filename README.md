# airtable-types-gen

Generate TypeScript types from Airtable base schemas with optional record flattening utilities.

Inspired by Supabase's type generation, this tool provides a simple CLI to generate strongly-typed interfaces from your Airtable bases, with smart detection of computed fields, property naming conflict resolution, and optional record flattening utilities.

## Features

- 🚀 **Simple CLI** - Inspired by `supabase gen types`
- 🎯 **Smart Type Detection** - 32+ Airtable field types mapped to TypeScript
- 🔒 **Computed Field Awareness** - Automatic detection of readonly/computed fields
- 🏷️ **Strict Types** - Union types for select fields, proper optional handling
- 🛠️ **Utility Functions** - Record flattening and helper types
- 📦 **Multi-file Output** - Generate one file per table with an index
- ✅ **Zod Schemas** - Generate Zod schemas with inferred TS types
- ✨ **Conflict Resolution** - Intelligent property naming for edge cases
- 🧪 **Well Tested** - Comprehensive test suite with Vitest

## Installation

```bash
npm install -g airtable-types-gen

# Or use without installing
npx airtable-types-gen --help
```

## Quick Start

### 1. Set up your environment

#### Option A: Using .env file (recommended)

```bash
# Copy the example file
cp .env.example .env

# Edit .env and fill in your values:
# AIRTABLE_PERSONAL_TOKEN=your_personal_access_token
# AIRTABLE_BASE_ID=appXXXXXXXX
```

#### Option B: Environment variables

```bash
export AIRTABLE_PERSONAL_TOKEN="your_personal_access_token"
export AIRTABLE_BASE_ID="appXXXXXXXX"
```

Get your personal access token from [Airtable Developer Hub](https://airtable.com/developers/web/api/introduction).

### 2. Generate types

```bash
# Generate types to stdout (uses .env file)
npx airtable-types-gen > types.ts

# Generate types to a specific file
npx airtable-types-gen --output src/types/airtable.ts

# Generate with flatten support (adds flattenRecord utilities)
npx airtable-types-gen --flatten --output types.ts

# Generate types for specific tables only
npx airtable-types-gen --tables "Users,Projects" --output types.ts

# You can still override with --base-id if needed
npx airtable-types-gen --base-id "appXXXXXXXX" --output types.ts
```

## CLI Options

```bash
airtable-types-gen [OPTIONS]

OPTIONS:
  -b, --base-id <ID>       Airtable base ID (required)
  -o, --output <FILE>      Output file or directory (optional, defaults to stdout)
  -f, --flatten           Generate types with flatten support
  -t, --tables <NAMES>    Comma-separated list of table names to include
      --format <FORMAT>    Output format: "typescript" (default) or "zod"
      --separate-files     Generate separate files per table (requires --output directory)
  -h, --help              Show help message
  -v, --version           Show version information

ENVIRONMENT VARIABLES:
  AIRTABLE_PERSONAL_TOKEN  Your Airtable personal access token (required)
  AIRTABLE_BASE_ID        Default base ID if --base-id is not provided
```

## Generated Types (TypeScript)

### Basic Interface

```typescript
/**
 * Interface generated for table "Users"
 * @description Users table from Airtable
 */
export interface UsersRecord {
  /** Unique Airtable record ID */
  id: string;
  Name: string;
  Email: string;
  Age?: number;
  Active: boolean;
  Role: 'Admin' | 'User' | 'Guest';
  /** 🔒 Computed by Airtable - readonly ISO date string */
  readonly Created?: string;
  /** 🔒 Computed by Airtable - auto-incrementing number */
  readonly 'Auto ID'?: number;
}
```

### Utility Types

```typescript
// Table name union
export type AirtableTableName = 'Users' | 'Projects';

// Get record type for a table
export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];

// CRUD operation types
export type CreateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'id'>>;
export type UpdateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'id'>> & {
  id: string;
};
export type ReadRecord<T extends AirtableTableName> = GetTableRecord<T>;
```

## Library Usage

### Import Generated Types

```typescript
import type { UsersRecord, ProjectsRecord, CreateRecord, UpdateRecord } from './types';

// Type-safe record creation
const newUser: CreateRecord<'Users'> = {
  Name: 'John Doe',
  Email: 'john@example.com',
  Active: true,
  Role: 'User',
  // Note: readonly fields like 'Created' and 'Auto ID' are automatically excluded
};
```

### Record Flattening

The package includes a powerful record flattening utility that removes Airtable's `FieldSet` wrapper:

```typescript
import { flattenRecord, flattenRecords } from 'airtable-types-gen';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: 'your-api-key' }).base('appXXXXXXXX');

// Flatten a single record
const record = await base('Users').find('recXXXXXXXX');
const flattened = flattenRecord(record);
console.log(flattened.Name); // Direct access, no .fields wrapper

// Flatten multiple records
// Works with array of Record<FieldSet> or Airtable's Records<FieldSet> collection
const records = await base('Users').select().all();
const flattened = flattenRecords(records);
// Or directly with the collection (e.g., from .select().firstPage())
const page = await base('Users').select({ pageSize: 50 }).firstPage();
const flattenedPage = flattenRecords(page);
flattened.forEach((user) => {
  console.log(user.Name, user.Email); // Direct access to fields
});

// Type-safe flattened results (v0.1.3+):
// If you generated types with --flatten, you can type the output as your table's flattened interface
import type { UsersRecord } from './types';

const typedUsers: UsersRecord[] = flattenRecords<UsersRecord>(records);
const oneUser: UsersRecord = flattenRecord<UsersRecord>(record);

// Note: Ensure your generated types were created with --flatten for the
// table interfaces (e.g., UsersRecord) to match the flattened shape.
```

### Advanced Usage

```typescript
import { generateTypes } from 'airtable-types-gen';

// Programmatic type generation (advanced)
const result = await generateTypes({
  baseId: 'appXXXXXXXX',
  token: 'your-token',
  flatten: true,
  tables: ['Users', 'Projects'],
});

console.log(result.content); // Generated TypeScript code
console.log(result.schema); // Parsed Airtable schema
```

## Zod Schemas (new in v0.2)

You can generate Zod schemas instead of TypeScript-only types:

```bash
# Single file with Zod schemas
npx airtable-types-gen --base-id appXXXXXXXX --format zod --output zod-schemas.ts

# Flattened Zod schemas
npx airtable-types-gen --base-id appXXXXXXXX --format zod --flatten --output zod-schemas-flat.ts

# One file per table (+ index.ts) with Zod
npx airtable-types-gen --base-id appXXXXXXXX --format zod --separate-files --output ./schemas
```

Example usage:

```ts
import { UsersSchema, type Users } from './schemas/users';
import { validateRecord, safeValidateRecord } from 'airtable-types-gen/runtime';

// Validate at runtime and get typed data
const user: Users = validateRecord(UsersSchema, {
  record_id: 'rec123',
  Name: 'Jane',
  Email: 'jane@example.com'
});

// Or safely
const result = safeValidateRecord(UsersSchema, someData);
if (result.success) {
  // result.data is typed as Users
} else {
  console.error(result.error);
}
```

## Multi-file generation (new in v0.2)

Generate one file per table plus an index re-export:

```bash
# TypeScript types per table
npx airtable-types-gen --base-id appXXXXXXXX --separate-files --output ./types

# Zod schemas per table
npx airtable-types-gen --base-id appXXXXXXXX --format zod --separate-files --output ./schemas
```

This produces files like:

```text
./schemas/
  users.ts
  projects.ts
  index.ts
```

## Integration Examples

### With Build Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "types:generate": "airtable-types-gen --base-id $AIRTABLE_BASE_ID --output src/types/airtable.ts",
    "types:watch": "chokidar 'airtable-schema.json' -c 'npm run types:generate'",
    "build": "npm run types:generate && tsc"
  }
}
```

### With GitHub Actions

```yaml
name: Generate Types
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch:

jobs:
  generate-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npx airtable-types-gen --base-id ${{ secrets.AIRTABLE_BASE_ID }} --output src/types/airtable.ts
        env:
          AIRTABLE_PERSONAL_TOKEN: ${{ secrets.AIRTABLE_PERSONAL_TOKEN }}

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'Update Airtable types'
          body: 'Auto-generated type updates from Airtable schema changes'
```

## Smart Features

### Computed Field Detection

Automatically detects and marks readonly fields:

- `formula`, `rollup`, `count`, `lookup`
- `createdTime`, `lastModifiedTime`
- `createdBy`, `lastModifiedBy`
- `autoNumber`

### Property Name Conflict Resolution

Handles edge cases gracefully:

- Reserved words and special characters
- Duplicate property names
- Conflicts with the `id` field

### Type Safety

- Union types for single/multiple select fields
- Optional properties for computed fields that may be undefined
- Proper typing for attachments, linked records, and user fields

## Development

```bash
# Clone and install
git clone https://github.com/Guischk/airtable-types-gen
cd airtable-types-gen
npm install

# Build
npm run build

# Test
npm test
npm run test:watch
npm run test:ui

# Lint
npm run lint
npm run format
```

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs to the `main` branch.

## Troubleshooting

See [KNOWN_ISSUES.md](KNOWN_ISSUES.md) for known issues and workarounds.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

---

Made with ❤️ for the Airtable + TypeScript community
