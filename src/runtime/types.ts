/**
 * Utility types for working with generated Airtable types
 * These are generic types that work with any generated table interface
 */

/**
 * Extract the table name from a record interface name
 * Example: UsersRecord -> 'Users'
 */
export type ExtractTableName<T extends string> = T extends `${infer U}Record` ? U : never;

/**
 * Make all properties of a type optional except the ID
 * Useful for creating partial updates while keeping ID required
 */
export type PartialExceptId<T extends { id: any }> = Partial<Omit<T, 'id'>> & Pick<T, 'id'>;

/**
 * Make all readonly properties writable
 * Useful for creating mock data or test fixtures
 */
export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Extract only the writable (non-readonly) properties from a type
 * Useful for create operations where computed fields should be excluded
 */
export type WritableOnly<T> = {
  [P in keyof T as T[P] extends Readonly<T[P]> ? never : P]: T[P];
};

/**
 * Generic type for Airtable API responses
 */
export interface AirtableResponse<T> {
  records: T[];
  offset?: string;
}

/**
 * Standard error response from Airtable API
 */
export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

/**
 * Options for batch operations
 */
export interface BatchOptions {
  batchSize?: number;
  delayMs?: number;
}

/**
 * Type guard to check if a value is an Airtable error
 */
export const isAirtableError = (value: any): value is AirtableError => {
  return value && typeof value === 'object' && 'error' in value;
};
