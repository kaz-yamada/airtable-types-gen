import { describe, it, expect } from 'vitest';
import { generateTableZodSchema, generateUtilityZodTypes } from '../../src/generator/zod-generator.js';
import { mockSchema, mockTable } from '../fixtures/mock-schema.js';

describe('Zod Generator', () => {
  describe('generateTableZodSchema', () => {
    it('should generate a Zod schema for a table', () => {
      const result = generateTableZodSchema(mockTable);

      expect(result).toContain("import { z } from 'zod'");
      expect(result).toContain('export const UsersSchema =');
      expect(result).toContain('export type Users =');
      expect(result).toContain('z.infer<typeof UsersSchema>');
    });

    it('should generate flattened Zod schema', () => {
      const result = generateTableZodSchema(mockTable, true);

      expect(result).toContain('record_id: z.string()');
      expect(result).toContain('Name: z.string()');
      expect(result).toContain('Email: z.string().email(');
    });

    it('should generate standard Airtable structure Zod schema', () => {
      const result = generateTableZodSchema(mockTable, false);

      expect(result).toContain('const UsersSchemaFields =');
      expect(result).toContain('export const UsersSchema =');
      expect(result).toContain('id: z.string()');
      expect(result).toContain('fields: UsersSchemaFields');
      expect(result).toContain('createdTime: z.string().datetime()');
    });

    it('should handle different field types correctly', () => {
      const result = generateTableZodSchema(mockTable);

      // String fields
      expect(result).toContain('Name: z.string()');
      
      // Email field
      expect(result).toContain("Email: z.string().email('Invalid email format')");
      
      // Number field
      expect(result).toContain('Age: z.number()');
      
      // Boolean field
      expect(result).toContain('IsActive: z.boolean()');
      
      // Select field (if present in mock)
      if (result.includes('Status:')) {
        expect(result).toMatch(/Status: z\.enum\(\['[^']+'/);
      }
    });

    it('should mark optional fields correctly', () => {
      const result = generateTableZodSchema(mockTable);

      // Check for optional modifier on computed fields
      if (result.includes('formula')) {
        expect(result).toContain('.optional()');
      }
    });

    it('should handle property name conflicts', () => {
      const tableWithConflicts = {
        ...mockTable,
        fields: [
          ...mockTable.fields,
          {
            id: 'fldConflict',
            name: 'id',
            type: 'number' as const,
            description: 'Field that conflicts with record id',
          },
        ],
      };

      const result = generateTableZodSchema(tableWithConflicts, true);
      
      // Should rename conflicting field
      expect(result).toContain('field_id:');
      expect(result).toContain('record_id: z.string()');
    });
  });

  describe('generateUtilityZodTypes', () => {
    it('should generate utility types for Zod schemas', () => {
      const result = generateUtilityZodTypes(mockSchema);

      expect(result).toContain('export type AirtableTableName =');
      expect(result).toContain('export interface AirtableTableSchemas');
      expect(result).toContain('export type GetTableSchema<T extends AirtableTableName>');
      expect(result).toContain('export type GetTableType<T extends AirtableTableName>');
      expect(result).toContain('export const validateRecord =');
    });

    it('should include all tables in union types', () => {
      const result = generateUtilityZodTypes(mockSchema);

      expect(result).toContain("'Users'");
      
      // Should contain schema and type mappings
      expect(result).toContain("'Users': { schema: UsersSchema, type: Users }");
    });
  });

  describe('Zod schema string generation', () => {
    it('should handle special characters in property names', () => {
      const tableWithSpecialChars = {
        ...mockTable,
        fields: [
          {
            id: 'fldSpecial',
            name: 'Field with spaces & symbols!',
            type: 'singleLineText' as const,
            description: 'Field with special characters in name',
          },
        ],
      };

      const result = generateTableZodSchema(tableWithSpecialChars, true);
      
      // Should use bracket notation for special characters
      expect(result).toContain('["Field with spaces & symbols!"]');
    });

    it('should generate proper Zod validation for different field types', () => {
      const tableWithAllTypes = {
        ...mockTable,
        name: 'AllTypes',
        fields: [
          { id: 'fld1', name: 'Text', type: 'singleLineText' as const },
          { id: 'fld2', name: 'Email', type: 'email' as const },
          { id: 'fld3', name: 'URL', type: 'url' as const },
          { id: 'fld4', name: 'Phone', type: 'phoneNumber' as const },
          { id: 'fld5', name: 'Number', type: 'number' as const },
          { id: 'fld6', name: 'Checkbox', type: 'checkbox' as const },
          { id: 'fld7', name: 'Date', type: 'date' as const },
          { id: 'fld8', name: 'DateTime', type: 'dateTime' as const },
          {
            id: 'fld9',
            name: 'Select',
            type: 'singleSelect' as const,
            options: { choices: [{ name: 'Option1' }, { name: 'Option2' }] },
          },
          {
            id: 'fld10',
            name: 'MultiSelect',
            type: 'multipleSelects' as const,
            options: { choices: [{ name: 'Tag1' }, { name: 'Tag2' }] },
          },
        ],
      };

      const result = generateTableZodSchema(tableWithAllTypes, true);

      expect(result).toContain('Text: z.string()');
      expect(result).toContain("Email: z.string().email('Invalid email format')");
      expect(result).toContain("URL: z.string().url('Invalid URL format')");
      expect(result).toContain("Phone: z.string().regex(/^[\\+]?[1-9][\\d]{0,15}$/, 'Invalid phone number format')");
      expect(result).toContain('Number: z.number()');
      expect(result).toContain('Checkbox: z.boolean()');
      expect(result).toContain("Date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format (YYYY-MM-DD)')");
      expect(result).toContain("DateTime: z.string().datetime('Invalid ISO datetime format')");
      expect(result).toContain("Select: z.enum(['Option1', 'Option2'])");
      expect(result).toContain("MultiSelect: z.array(z.enum(['Tag1', 'Tag2']))");
    });
  });
});