import { AirtableBaseSchema, AirtableTable, GenerateOptions, GenerateResult } from '../types.js';
import {
  fetchBaseSchema,
  mapAirtableTypeToTSEnhanced,
  generateInterfaceName,
  generatePropertyName,
  isAlwaysPresentComputed,
} from './schema.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const generateTableInterface = (table: AirtableTable, flatten: boolean = false): string => {
  const interfaceName = generateInterfaceName(table.name);

  const propertyNames = new Set<string>();
  propertyNames.add('id');

  const properties = table.fields
    .map((field) => {
      let propertyName = generatePropertyName(field.name);

      if (propertyNames.has(propertyName)) {
        if (propertyName === 'id') {
          if (field.type === 'autoNumber') {
            propertyName = 'auto_id';
          } else if (field.type === 'number') {
            propertyName = 'record_id';
          } else {
            propertyName = `${propertyName}_${field.type}`;
          }
        } else {
          propertyName = `${propertyName}_${field.type}`;
        }
      }
      propertyNames.add(propertyName);

      const typeMapping = mapAirtableTypeToTSEnhanced(field);
      const propertyType = typeMapping.type;
      const isReadonly = typeMapping.readonly;

      const isOptional = isReadonly && !isAlwaysPresentComputed(field);
      const optional = isOptional ? '?' : '';

      const descriptions = [];
      if (field.description) {
        descriptions.push(field.description);
      }
      if (typeMapping.description) {
        descriptions.push(typeMapping.description);
      }

      const comment = descriptions.length > 0 ? `\\n  /** ${descriptions.join(' - ')} */` : '';

      const needsBrackets = /[^a-zA-Z0-9_$]/.test(propertyName);
      const propertyKey = needsBrackets
        ? `["${propertyName.replace(/"/g, '\\\\"')}"]`
        : propertyName;

      const readonlyModifier = isReadonly ? 'readonly ' : '';

      return `${comment}
  ${readonlyModifier}${propertyKey}${optional}: ${propertyType};`;
    })
    .join('\\n');

  return `/**
 * Interface generated for table "${table.name}"
 * @description ${table.description || `Table ${table.name} from Airtable`}
 */
export interface ${interfaceName} {
  /** Unique Airtable record ID */
  id: string;${properties}
}`;
};

const generateUtilityTypes = (schema: AirtableBaseSchema, flatten: boolean = false): string => {
  const tableNames = schema.tables
    .map((table) => `'${table.name.replace(/'/g, "\\\\'")}'`)
    .join(' | ');

  const tableTypesMapping = schema.tables
    .map(
      (table) => `  '${table.name.replace(/'/g, "\\\\'")}': ${generateInterfaceName(table.name)};`
    )
    .join('\\n');

  const utilityTypes = `
/**
 * Union type of all available table names
 */
export type AirtableTableName = ${tableNames};

/**
 * Mapping of table names to their record types
 */
export interface AirtableTableTypes {
${tableTypesMapping}
}

/**
 * Generic type to get the record type for a table
 */
export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];

/**
 * Airtable select options for queries
 */
export interface AirtableSelectOptions {
  view?: string;
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  cellFormat?: 'json' | 'string';
  timeZone?: string;
  userLocale?: string;
}

/**
 * Type for creating new records (partial for optional fields)
 */
export type CreateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'id'>> & {
  id?: never;
};

/**
 * Type for updating existing records (partial for selective updates)
 */
export type UpdateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'id'>> & {
  id: string;
};

/**
 * Type for reading records (all fields)
 */
export type ReadRecord<T extends AirtableTableName> = GetTableRecord<T>;`;

  if (flatten) {
    return (
      utilityTypes +
      `

/**
 * Flattened record type - removes Airtable FieldSet wrapper
 */
export interface FlattenedRecord {
  id: string;
  [key: string]: any;
}`
    );
  }

  return utilityTypes;
};

const generateImports = (flatten: boolean = false): string => {
  const baseImports = `// Types generated automatically from Airtable schema
// ⚠️  Do not modify this file manually - it will be regenerated

`;

  if (flatten) {
    return (
      baseImports +
      `import type { FieldSet, Record } from 'airtable';

`
    );
  }

  return baseImports;
};

const generateFlattenFunction = (): string => {
  return `
/**
 * Flattens an Airtable record by extracting fields and adding the ID
 * This is a re-export from the runtime package for convenience
 */
export { flattenRecord } from 'airtable-types-gen/runtime';`;
};

export const generateAllTypes = (schema: AirtableBaseSchema, flatten: boolean = false): string => {
  const imports = generateImports(flatten);

  const interfaces = schema.tables
    .map((table) => generateTableInterface(table, flatten))
    .join('\\n\\n');

  const utilityTypes = generateUtilityTypes(schema, flatten);

  const flattenFunction = flatten ? generateFlattenFunction() : '';

  return imports + interfaces + utilityTypes + flattenFunction;
};

export const generateTypes = async (options: GenerateOptions): Promise<GenerateResult> => {
  console.log('[Generator] Starting type generation...');

  const schema = await fetchBaseSchema(options.baseId, options.token);

  let filteredSchema = schema;
  if (options.tables && options.tables.length > 0) {
    filteredSchema = {
      tables: schema.tables.filter((table) => options.tables!.includes(table.name)),
    };
    console.log(`[Generator] Filtering to ${options.tables.length} specified tables`);
  }

  const content = generateAllTypes(filteredSchema, options.flatten || false);

  console.log(`[Generator] Generated types for ${filteredSchema.tables.length} tables`);

  return {
    content,
    schema: filteredSchema,
  };
};
