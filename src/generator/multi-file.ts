import { promises as fs } from 'fs';
import path from 'path';
import { AirtableBaseSchema, AirtableTable } from '../types.js';
import { generateTableZodSchema, generateUtilityZodTypes } from './zod-generator.js';
import { generateSchemaName, generateTypeName } from './zod-schema.js';
import { generateTableInterface } from './types.js';

export interface MultiFileResult {
  files: { [fileName: string]: string };
  indexContent: string;
}

export const generateTableFileName = (tableName: string): string => {
  return tableName
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '') // Remove special characters except spaces, hyphens, underscores
    .replace(/[\s-_]+/g, '-') // Replace spaces, hyphens, underscores with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const generateSingleTableFile = (
  table: AirtableTable,
  options: { format: 'typescript' | 'zod'; flatten?: boolean }
): string => {
  const { format, flatten = false } = options;

  if (format === 'zod') {
    // Include import inside each file
    return generateTableZodSchema(table, flatten, { includeImport: true });
  } else {
    // Use existing TypeScript generator but need to extract the single table logic
    return generateTableInterface(table, flatten);
  }
};

export const generateIndexFile = (
  schema: AirtableBaseSchema,
  options: { format: 'typescript' | 'zod'; flatten?: boolean }
): string => {
  const { format } = options;
  const lines: string[] = [];

  // Add header comment
  lines.push('// Auto-generated index file - do not modify manually');
  lines.push('// Re-exports all table schemas/types');
  lines.push('');

  // First, add local imports so that referenced symbols exist in this module scope
  schema.tables.forEach((table) => {
    const fileName = generateTableFileName(table.name);
    if (format === 'zod') {
      const schemaName = generateSchemaName(table.name);
      const typeName = generateTypeName(table.name);
      lines.push(`import { ${schemaName}, type ${typeName} } from './${fileName}.js';`);
    } else {
      const interfaceName =
        table.name
          .replace(/[^a-zA-Z0-9\s-_]/g, '')
          .replace(/[\s-]+/g, '_')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('') + 'Record';
      lines.push(`import type { ${interfaceName} } from './${fileName}.js';`);
    }
  });

  lines.push('');

  // Generate exports for each table (public surface)
  schema.tables.forEach((table) => {
    const fileName = generateTableFileName(table.name);

    if (format === 'zod') {
      const schemaName = generateSchemaName(table.name);
      const typeName = generateTypeName(table.name);
      lines.push(`export { ${schemaName}, type ${typeName} } from './${fileName}.js';`);
    } else {
      const interfaceName =
        table.name
          .replace(/[^a-zA-Z0-9\s-_]/g, '')
          .replace(/[\s-]+/g, '_')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('') + 'Record';

      lines.push(`export type { ${interfaceName} } from './${fileName}.js';`);
    }
  });

  lines.push('');

  // Add utility types
  if (format === 'zod') {
    lines.push('// Utility types for Zod schemas');
    // Import z for z.infer in utility types
    lines.push(`import { z } from 'zod';`);
    const utilityTypes = generateUtilityZodTypes(schema, { flatten: options.flatten });
    lines.push(utilityTypes);
  } else {
    // Add TypeScript utility types (adapted from existing generator)
    lines.push('// Utility types');
    const tableNames = schema.tables
      .map((table) => `'${table.name.replace(/'/g, "\\'")}'`)
      .join(' | ');

    const tableTypesMapping = schema.tables
      .map((table) => {
        const interfaceName =
          table.name
            .replace(/[^a-zA-Z0-9\s-_]/g, '')
            .replace(/[\s-]+/g, '_')
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Record';
        return `  '${table.name.replace(/'/g, "\\'")}': ${interfaceName};`;
      })
      .join('\n');

    lines.push(`export type AirtableTableName = ${tableNames};`);
    lines.push('');
    lines.push('export interface AirtableTableTypes {');
    lines.push(tableTypesMapping);
    lines.push('}');
    lines.push('');
    lines.push('export type GetTableRecord<T extends AirtableTableName> = AirtableTableTypes[T];');
  }

  return lines.join('\n');
};

export const generateMultipleFiles = async (
  schema: AirtableBaseSchema,
  outputDir: string,
  options: { format: 'typescript' | 'zod'; flatten?: boolean }
): Promise<MultiFileResult> => {
  const files: { [fileName: string]: string } = {};

  // Generate individual table files
  for (const table of schema.tables) {
    const fileName = generateTableFileName(table.name) + '.ts';
    const content = generateSingleTableFile(table, options);
    files[fileName] = content;
  }

  // Generate index file
  const indexContent = generateIndexFile(schema, options);
  files['index.ts'] = indexContent;

  return {
    files,
    indexContent,
  };
};

export const writeMultipleFiles = async (
  outputDir: string,
  files: { [fileName: string]: string }
): Promise<void> => {
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Write all files
  const writePromises = Object.entries(files).map(async ([fileName, content]) => {
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`[MultiFile] Generated: ${filePath}`);
  });

  await Promise.all(writePromises);
  console.log(`[MultiFile] Generated ${Object.keys(files).length} files in ${outputDir}`);
};
