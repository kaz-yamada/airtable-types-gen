#!/usr/bin/env node

// Load .env file if it exists (for convenience)
import { config } from 'dotenv';
config({ path: '.env' });

import { parseArguments, printHelp, printVersion } from './options.js';
import { executeGenerate } from './commands.js';

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  // Handle help and version flags
  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    printVersion();
    return;
  }

  // Execute the main command (generate types)
  await executeGenerate(options);
};

// Run the CLI
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
