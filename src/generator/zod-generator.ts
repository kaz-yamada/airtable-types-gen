import { z } from 'zod';
import { AirtableBaseSchema, AirtableTable } from '../types.js';
import {
  mapAirtableTypeToZod,
  generatePropertyName,
  generateSchemaName,
  generateTypeName,
} from './zod-schema.js';

export const generateTableZodSchema = (
  table: AirtableTable,
  flatten: boolean = false,
  options?: { includeImport?: boolean }
): string => {
  const schemaName = generateSchemaName(table.name);
  const typeName = generateTypeName(table.name);
  const lines: string[] = [];

  // Add imports
  const includeImport = options?.includeImport ?? true;
  if (includeImport) {
    lines.push("import { z } from 'zod';");
    lines.push('');
  }

  // Add schema header comment
  lines.push('/**');
  lines.push(` * Zod schema for table "${table.name}"`);
  lines.push(` * @description ${table.description || `Table ${table.name} from Airtable`}`);
  lines.push(' */');

  if (flatten) {
    // Generate flattened schema (all fields at root level)
    lines.push(`export const ${schemaName} = z.object({`);
    lines.push('  /** Unique Airtable record ID */');
    lines.push('  record_id: z.string(),');

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

      const zodMapping = mapAirtableTypeToZod(field);

      // Add empty line before property for readability
      lines.push('');

      // Add comment if we have descriptions
      const descriptions = [];
      if (field.description) {
        const cleanDesc = field.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }
      if (zodMapping.description) {
        const cleanDesc = zodMapping.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }

      if (descriptions.length > 0) {
        lines.push(`  /** ${descriptions.join(' - ')} */`);
      }

      // Add property
      const needsBrackets = /[^a-zA-Z0-9_$]/.test(propertyName);
      const propertyKey = needsBrackets ? `["${propertyName.replace(/"/g, '\\"')}"]` : propertyName;

      // Convert Zod schema to string representation
      const schemaStr = generateZodSchemaString(zodMapping.schema);
      lines.push(`  ${propertyKey}: ${schemaStr},`);
    });

    lines.push('});');
  } else {
    // Generate standard Airtable schema (native structure)
    const fieldsSchemaName = `${schemaName}Fields`;

    // First, generate the Fields schema
    lines.push(`const ${fieldsSchemaName} = z.object({`);

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

      const zodMapping = mapAirtableTypeToZod(field);

      // Add empty line before property if we have previous fields
      if (index > 0) {
        lines.push('');
      }

      // Add comment if we have descriptions
      const descriptions = [];
      if (field.description) {
        const cleanDesc = field.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }
      if (zodMapping.description) {
        const cleanDesc = zodMapping.description
          .replace(/\\n/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\r/g, ' ');
        descriptions.push(cleanDesc);
      }

      if (descriptions.length > 0) {
        lines.push(`  /** ${descriptions.join(' - ')} */`);
      }

      // Add property
      const needsBrackets = /[^a-zA-Z0-9_$]/.test(propertyName);
      const propertyKey = needsBrackets ? `["${propertyName.replace(/"/g, '\\"')}"]` : propertyName;

      // Convert Zod schema to string representation
      const schemaStr = generateZodSchemaString(zodMapping.schema);
      lines.push(`  ${propertyKey}: ${schemaStr},`);
    });

    lines.push('});');
    lines.push('');

    // Then generate the main record schema
    lines.push(`export const ${schemaName} = z.object({`);
    lines.push('  /** Unique Airtable record ID */');
    lines.push('  id: z.string(),');
    lines.push('');
    lines.push('  /** Record fields */');
    lines.push(`  fields: ${fieldsSchemaName},`);
    lines.push('');
    lines.push('  /** Record creation time */');
    lines.push('  createdTime: z.string().datetime(),');
    lines.push('});');
  }

  // Add type inference export
  lines.push('');
  lines.push('/**');
  lines.push(` * Inferred TypeScript type for ${table.name}`);
  lines.push(' */');
  lines.push(`export type ${typeName} = z.infer<typeof ${schemaName}>;`);

  return lines.join('\n');
};

const generateZodSchemaString = (schema: z.ZodType<any>): string => {
  // This is a simplified approach to convert Zod schemas to string
  // In a real implementation, you might need a more sophisticated approach

  if (schema instanceof z.ZodString) {
    let str = 'z.string()';
    const checks = (schema as any)._def.checks || [];
    for (const check of checks) {
      switch (check.kind) {
        case 'email':
          str += `.email('${check.message || 'Invalid email format'}')`;
          break;
        case 'url':
          str += `.url('${check.message || 'Invalid URL format'}')`;
          break;
        case 'regex':
          str += `.regex(${check.regex}, '${check.message || 'Invalid format'}')`;
          break;
        case 'datetime':
          str += `.datetime('${check.message || 'Invalid ISO datetime format'}')`;
          break;
      }
    }
    return str;
  }

  if (schema instanceof z.ZodNumber) {
    let str = 'z.number()';
    const checks = (schema as any)._def.checks || [];
    for (const check of checks) {
      switch (check.kind) {
        case 'int':
          str += '.int()';
          break;
        case 'min':
          str += `.min(${check.value})`;
          break;
        case 'max':
          str += `.max(${check.value})`;
          break;
      }
    }
    return str;
  }

  if (schema instanceof z.ZodBoolean) {
    return 'z.boolean()';
  }

  if (schema instanceof z.ZodEnum) {
    const values = (schema as any)._def.values;
    const enumValues = values.map((v: string) => `'${v}'`).join(', ');
    return `z.enum([${enumValues}])`;
  }

  if (schema instanceof z.ZodArray) {
    const elementType = generateZodSchemaString((schema as any)._def.type);
    return `z.array(${elementType})`;
  }

  if (schema instanceof z.ZodObject) {
    // For simple objects, we'll just return a generic representation
    return 'z.object({ /* ... */ })';
  }

  if (schema instanceof z.ZodUnion) {
    const options = (schema as any)._def.options;
    const unionTypes = options.map((option: z.ZodType<any>) => generateZodSchemaString(option));
    return `z.union([${unionTypes.join(', ')}])`;
  }

  if (schema instanceof z.ZodOptional) {
    const innerType = generateZodSchemaString((schema as any)._def.innerType);
    return `${innerType}.optional()`;
  }

  // Fallback for complex types
  return 'z.any()';
};

export const generateUtilityZodTypes = (schema: AirtableBaseSchema): string => {
  const tableNames = schema.tables
    .map((table) => `'${table.name.replace(/'/g, "\\'")}'`)
    .join(' | ');

  const schemaExports = schema.tables
    .map((table) => {
      const schemaName = generateSchemaName(table.name);
      const typeName = generateTypeName(table.name);
      return `  '${table.name.replace(/'/g, "\\'")}': { schema: typeof ${schemaName}, type: ${typeName} };`;
    })
    .join('\n');

  return `
/**
 * Union type of all available table names
 */
export type AirtableTableName = ${tableNames};

/**
 * Mapping of table names to their schemas and types
 */
export interface AirtableTableSchemas {
${schemaExports}
}

/**
 * Generic type to get the Zod schema for a table
 */
export type GetTableSchema<T extends AirtableTableName> = AirtableTableSchemas[T]['schema'];

/**
 * Generic type to get the TypeScript type for a table
 */
export type GetTableType<T extends AirtableTableName> = AirtableTableSchemas[T]['type'];

/**
 * Validation helper function
 */
export const validateRecord = <T extends AirtableTableName>(
  tableName: T,
  data: unknown
): GetTableType<T> => {
  // This would need to be implemented with actual schema lookup
  throw new Error('Schema validation not implemented yet');
};
`;
};
