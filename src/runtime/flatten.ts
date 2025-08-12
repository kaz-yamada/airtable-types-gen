import type { FieldSet, Record, Records } from 'airtable';

/**
 * Represents a flattened Airtable record with record_id and fields at the top level
 */
export interface FlattenedRecord {
  record_id: string;
  [key: string]: unknown;
}

/**
 * Flattens an Airtable record by extracting the ID and fields to the top level
 * This removes the Airtable FieldSet wrapper structure for easier usage
 *
 * @param record - The Airtable record to flatten
 * @returns A flattened record with record_id and all fields at the top level
 *
 * @example
 * ```typescript
 * const record = await base('Table').find('recXXXXXX');
 * const flat = flattenRecord(record);
 * console.log(flat.record_id); // 'recXXXXXX'
 * console.log(flat.Name); // Direct access to field value
 * ```
 */
export const flattenRecord = <T extends { record_id: string } = FlattenedRecord>(
  record: Record<FieldSet>
): T => {
  const { fields, id } = record;
  return {
    record_id: id,
    ...fields,
  } as T;
};

/**
 * Flattens multiple Airtable records
 *
 * @param records - Array of Airtable records to flatten
 * @returns Array of flattened records
 *
 * @example
 * ```typescript
 * const records = await base('Table').select().all();
 * const flattened = flattenRecords(records);
 * ```
 */
export const flattenRecords = <T extends { record_id: string } = FlattenedRecord>(
  records: Record<FieldSet>[] | Records<FieldSet>
): T[] => {
  // Both Array<Record<...>> and Records<...> are array-like collections of Airtable records
  return (records as ReadonlyArray<Record<FieldSet>>).map((r) => flattenRecord<T>(r));
};
