import { AirtableBaseSchema, AirtableTable, GenerateOptions, GenerateResult } from '../types.js';
import {
  fetchBaseSchema,
  mapAirtableTypeToTSEnhanced,
  generateInterfaceName,
  generatePropertyName,
  isAlwaysPresentComputed,
} from './schema.js';

export const generateTableInterface = (table: AirtableTable, flatten: boolean = false): string => {
  const interfaceName = generateInterfaceName(table.name);
  const interfaceLines: string[] = [];

  // Add interface header
  interfaceLines.push('/**');
  interfaceLines.push(` * Interface generated for table "${table.name}"`);
  interfaceLines.push(
    ` * @description ${table.description || `Table ${table.name} from Airtable`}`
  );
  interfaceLines.push(' */');

  if (flatten) {
    // Generate flattened interface (all fields at root level)
    interfaceLines.push(`export interface ${interfaceName} {`);
    interfaceLines.push('  /** Unique Airtable record ID */');
    interfaceLines.push('  record_id: string;');

    const propertyNames = new Set<string>();
    propertyNames.add('record_id');

    table.fields.forEach((field) => {
      let propertyName = generatePropertyName(field.name);

      // Handle property name conflicts
      if (propertyNames.has(propertyName) || propertyName === 'id') {
        if (propertyName === 'id') {
          if (field.type === 'autoNumber') {
            propertyName = 'auto_id';
          } else if (field.type === 'number') {
            propertyName = 'field_id'; // Different from record_id
          } else {
            propertyName = `id_${field.type}`;
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
        const cleanDesc = field.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }
      if (typeMapping.description) {
        const cleanDesc = typeMapping.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }

      // Add empty line before property if we had previous properties
      if (interfaceLines.length > 7) {
        interfaceLines.push('');
      }

      // Add comment if we have descriptions
      if (descriptions.length > 0) {
        interfaceLines.push(`  /** ${descriptions.join(' - ')} */`);
      }

      // Add property
      const needsBrackets = /[^a-zA-Z0-9_$]/.test(propertyName);
      const propertyKey = needsBrackets ? `["${propertyName.replace(/"/g, '\\"')}"]` : propertyName;

      const readonlyModifier = isReadonly ? 'readonly ' : '';
      interfaceLines.push(`  ${readonlyModifier}${propertyKey}${optional}: ${propertyType};`);
    });

    interfaceLines.push('}');
  } else {
    // Generate standard Airtable interface (native structure)
    const fieldsInterfaceName = `${interfaceName}Fields`;

    // First, generate the Fields interface
    interfaceLines.push(`interface ${fieldsInterfaceName} {`);

    const propertyNames = new Set<string>();

    table.fields.forEach((field, index) => {
      let propertyName = generatePropertyName(field.name);

      // Handle property name conflicts
      if (propertyNames.has(propertyName)) {
        if (field.type === 'autoNumber') {
          propertyName = 'auto_id';
        } else if (field.type === 'number' && propertyName === 'id') {
          propertyName = 'record_id';
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
        const cleanDesc = field.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }
      if (typeMapping.description) {
        const cleanDesc = typeMapping.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }

      // Add empty line before property if we have previous fields
      if (index > 0) {
        interfaceLines.push('');
      }

      // Add comment if we have descriptions
      if (descriptions.length > 0) {
        interfaceLines.push(`  /** ${descriptions.join(' - ')} */`);
      }

      // Add property
      const needsBrackets = /[^a-zA-Z0-9_$]/.test(propertyName);
      const propertyKey = needsBrackets ? `["${propertyName.replace(/"/g, '\\"')}"]` : propertyName;

      const readonlyModifier = isReadonly ? 'readonly ' : '';
      interfaceLines.push(`  ${readonlyModifier}${propertyKey}${optional}: ${propertyType};`);
    });

    interfaceLines.push('}');
    interfaceLines.push('');

    // Then generate the main record interface
    interfaceLines.push(`export interface ${interfaceName} {`);
    interfaceLines.push('  /** Unique Airtable record ID */');
    interfaceLines.push('  id: string;');
    interfaceLines.push('');
    interfaceLines.push('  /** Record fields */');
    interfaceLines.push(`  fields: ${fieldsInterfaceName};`);
    interfaceLines.push('');
    interfaceLines.push('  /** Record creation time */');
    interfaceLines.push('  createdTime: string;');
    interfaceLines.push('}');
  }

  return interfaceLines.join('\n');
};

const generateUtilityTypes = (schema: AirtableBaseSchema, flatten: boolean = false): string => {
  const tableNames = schema.tables
    .map((table) => `'${table.name.replace(/'/g, "\\'")}'`)
    .join(' | ');

  const tableTypesMapping = schema.tables
    .map((table) => `  '${table.name.replace(/'/g, "\\'")}': ${generateInterfaceName(table.name)};`)
    .join('\n');

  const tableNamesArray = schema.tables
    .map((table) => `'${table.name.replace(/'/g, "\\'")}'`)
    .join(', ');

  if (flatten) {
    // Flattened mode utility types
    return `
/**
 * Union type of all available table names
 */
export type AirtableTableName = ${tableNames};

/**
 * Array of all available table names (runtime constant)
 * Allows iteration over table names at runtime
 */
export const AIRTABLE_TABLE_NAMES = [${tableNamesArray}] as const;

/**
 * Mapping of table names to their flattened record types
 */
export interface AirtableTableTypes {
${tableTypesMapping}
}

/**
 * Generic type to get the flattened record type for a table
 */
export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];

/**
 * Type for creating new records (partial for optional fields)
 * Note: record_id should not be provided when creating
 */
export type CreateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'record_id'>> & {
  record_id?: never;
};

/**
 * Type for updating existing records (partial for selective updates)
 */
export type UpdateRecord<T extends AirtableTableName> = Partial<Omit<GetTableRecord<T>, 'record_id'>> & {
  record_id: string;
};

/**
 * Type for reading flattened records (all fields)
 */
export type ReadRecord<T extends AirtableTableName> = GetTableRecord<T>;

/**
 * Flattened record type - removes Airtable FieldSet wrapper
 */
export interface FlattenedRecord {
  [key: string]: any;
}
/**
 * Flattens an Airtable record by extracting fields and adding the ID
 * This is a re-export from the runtime package for convenience
 */
export { flattenRecord } from 'airtable-types-gen/runtime';
`;
  } else {
    // Standard mode utility types (native Airtable structure)
    return `
/**
 * Union type of all available table names
 */
export type AirtableTableName = ${tableNames};

/**
 * Array of all available table names (runtime constant)
 * Allows iteration over table names at runtime
 */
export const AIRTABLE_TABLE_NAMES = [${tableNamesArray}] as const;

/**
 * Mapping of table names to their record types (native Airtable structure)
 */
export interface AirtableTableTypes {
${tableTypesMapping}
}

/**
 * Generic type to get the record type for a table
 */
export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];

/**
 * Extract the fields type from a record type
 */
export type GetTableFields<T extends AirtableTableName> = GetTableRecord<T>['fields'];

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
 * Type for creating new records (only fields needed)
 */
export type CreateRecord<T extends AirtableTableName> = {
  fields: Partial<GetTableFields<T>>;
};

/**
 * Type for updating existing records (id + partial fields)
 */
export type UpdateRecord<T extends AirtableTableName> = {
  id: string;
  fields: Partial<GetTableFields<T>>;
};

/**
 * Type for reading records (full native Airtable structure)
 */
export type ReadRecord<T extends AirtableTableName> = GetTableRecord<T>;`;
  }
};

const generateImports = (): string => {
  const baseImports = `// Types generated automatically from Airtable schema
// ⚠️  Do not modify this file manually - it will be regenerated

`;

  return baseImports;
};

export const generateAllTypes = (schema: AirtableBaseSchema, flatten: boolean = false): string => {
  const imports = generateImports();

  const interfaces = schema.tables
    .map((table) => generateTableInterface(table, flatten))
    .join('\n\n');

  const utilityTypes = generateUtilityTypes(schema, flatten);

  return imports + interfaces + utilityTypes;
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
