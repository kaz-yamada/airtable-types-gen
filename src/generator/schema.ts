import { AirtableBaseSchema, AirtableField, TypeMappingResult } from '../types.js';

// Types de champs calculés par Airtable (readonly)
const COMPUTED_FIELD_TYPES = [
  'formula',
  'rollup',
  'count',
  'lookup',
  'createdTime',
  'lastModifiedTime',
  'createdBy',
  'lastModifiedBy',
  'autoNumber',
  'aiText',
] as const;

// Types de champs computed qui sont TOUJOURS présents (jamais undefined)
const ALWAYS_PRESENT_COMPUTED_TYPES = ['autoNumber', 'createdTime', 'lastModifiedTime'] as const;

// Champs spéciaux qui sont toujours présents selon leur nom
const ALWAYS_PRESENT_FIELD_NAMES = ['airtable_id', 'id'] as const;

export const detectComputedField = (field: AirtableField): boolean => {
  return COMPUTED_FIELD_TYPES.includes(field.type as any);
};

export const isAlwaysPresentComputed = (field: AirtableField): boolean => {
  if (ALWAYS_PRESENT_COMPUTED_TYPES.includes(field.type as any)) {
    return true;
  }

  const fieldNameLower = field.name.toLowerCase();
  return ALWAYS_PRESENT_FIELD_NAMES.some(
    (name) => fieldNameLower === name || fieldNameLower.includes(name)
  );
};

export const enrichFieldMetadata = (field: AirtableField): AirtableField => {
  const isComputed = detectComputedField(field);
  return {
    ...field,
    isComputed,
    isReadonly: isComputed,
  };
};

export const fetchBaseSchema = async (
  baseId: string,
  token: string
): Promise<AirtableBaseSchema> => {
  try {
    console.log(`[Schema] Fetching base schema for ${baseId}`);

    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: unknown = await response.json();

    console.log(
      `[Schema] Successfully fetched schema for ${(data as any)?.tables?.length || 0} tables`
    );

    return data as AirtableBaseSchema;
  } catch (error) {
    console.error('[Schema] Error fetching base schema:', error);
    throw error;
  }
};

export const mapAirtableTypeToTSEnhanced = (field: AirtableField): TypeMappingResult => {
  const enrichedField = enrichFieldMetadata(field);
  const readonly = enrichedField.isReadonly || false;

  let type: string;
  let strictType: string;
  let description: string | undefined;

  switch (field.type) {
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'email':
    case 'url':
    case 'phoneNumber':
      type = strictType = 'string';
      break;

    case 'number':
    case 'currency':
    case 'percent':
    case 'rating':
      type = strictType = 'number';
      break;

    case 'checkbox':
      type = strictType = 'boolean';
      break;

    case 'singleSelect':
      if (field.options?.choices) {
        const choices = field.options.choices.map((choice: any) => `"${choice.name}"`).join(' | ');
        type = strictType = choices || 'string';
      } else {
        type = strictType = 'string';
      }
      break;

    case 'multipleSelects':
      if (field.options?.choices) {
        const choices = field.options.choices.map((choice: any) => `"${choice.name}"`).join(' | ');
        type = strictType = `Array<${choices || 'string'}>`;
      } else {
        type = strictType = 'string[]';
      }
      break;

    case 'date':
    case 'dateTime':
      type = strictType = 'string';
      description = 'ISO date string';
      break;

    case 'createdTime':
    case 'lastModifiedTime':
      type = strictType = 'string';
      description = readonly
        ? '🔒 Computed by Airtable - readonly ISO date string'
        : 'ISO date string';
      break;

    case 'multipleAttachments':
      type = strictType =
        'Array<{ id: string; url: string; filename: string; size: number; type: string }>';
      break;

    case 'multipleRecordLinks':
      type = strictType = 'string[]';
      description = 'Array of linked record IDs';
      break;

    case 'formula':
      if (field.options?.result?.type === 'number') {
        type = 'number';
        strictType = 'number';
      } else if (field.options?.result?.type === 'currency') {
        type = 'number';
        strictType = 'number';
      } else if (field.options?.result?.type === 'text') {
        type = 'string';
        strictType = 'string';
      } else {
        type = 'string';
        strictType = 'string';
      }
      description = readonly ? '🔒 Computed by Airtable - formula result' : 'Formula result';
      break;

    case 'rollup':
      type = 'string | number';
      strictType = 'string | number';
      description = readonly
        ? '🔒 Computed by Airtable - aggregated values from linked records'
        : 'Rollup values';
      break;

    case 'count':
      type = strictType = 'number';
      description = readonly
        ? '🔒 Computed by Airtable - count of linked records'
        : 'Count of linked records';
      break;

    case 'lookup':
      type = 'string[]';
      strictType = 'string[]';
      description = readonly
        ? '🔒 Computed by Airtable - values from linked records'
        : 'Lookup values';
      break;

    case 'createdBy':
    case 'lastModifiedBy':
      type = strictType = '{ id: string; email: string; name: string }';
      description = readonly ? '🔒 Computed by Airtable - user information' : 'User information';
      break;

    case 'barcode':
      type = strictType = '{ text: string; type: string }';
      break;

    case 'button':
      type = strictType = '{ label: string; url: string }';
      break;

    case 'autoNumber':
      type = strictType = 'number';
      description = readonly
        ? '🔒 Computed by Airtable - auto-incrementing number'
        : 'Auto-incrementing number';
      break;

    case 'multipleLookupValues':
      type = 'string[]';
      strictType = 'string[]';
      description = readonly
        ? '🔒 Computed by Airtable - multiple lookup values'
        : 'Multiple lookup values';
      break;

    case 'aiText':
      type =
        '{ state: "generated" | "pending" | "error" | "empty"; value: string; isStale: boolean }';
      strictType = 'AirtableAiTextValue';
      description = readonly
        ? '🔒 Computed by Airtable - AI generated text object'
        : 'AI generated text object';
      break;

    default:
      console.warn(`[Schema] Unknown field type: ${field.type}`);
      type = 'string';
      strictType = 'string';
      break;
  }

  return {
    type,
    readonly,
    strictType,
    description,
  };
};

export const generateInterfaceName = (tableName: string): string => {
  const cleanName = tableName
    // Replace special characters and spaces with underscores
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/[\s-]+/g, '_')
    // Split on underscores and capitalize each word
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  return cleanName + 'Record';
};

export const generatePropertyName = (fieldName: string): string => {
  return fieldName;
};
