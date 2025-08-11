import * as fs from 'fs/promises';
import { generateTypes } from '../generator/index.js';
import { CliOptions } from './options.js';

export const executeGenerate = async (options: CliOptions): Promise<void> => {
  // Validate required options
  const baseId = options.baseId || process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PERSONAL_TOKEN;

  if (!baseId) {
    console.error(
      'Error: Base ID is required. Provide it via --base-id or AIRTABLE_BASE_ID environment variable.'
    );
    process.exit(1);
  }

  if (!token) {
    console.error(
      'Error: Airtable personal token is required. Set AIRTABLE_PERSONAL_TOKEN environment variable.'
    );
    process.exit(1);
  }

  try {
    // Generate the types
    const result = await generateTypes({
      baseId,
      token,
      flatten: options.flatten || false,
      tables: options.tables,
    });

    // Output the result
    if (options.output) {
      // Write to file
      await fs.writeFile(options.output, result.content);
      console.error(`✅ Types generated successfully and saved to ${options.output}`);

      // Print summary to stderr so it doesn't interfere with stdout redirection
      console.error(`📊 Generated types for ${result.schema.tables.length} tables:`);
      result.schema.tables.forEach((table) => {
        console.error(`   - ${table.name} (${table.fields.length} fields)`);
      });
    } else {
      // Write to stdout (like supabase)
      process.stdout.write(result.content);

      // Print summary to stderr
      console.error(`✅ Types generated for ${result.schema.tables.length} tables`);
    }
  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
};
