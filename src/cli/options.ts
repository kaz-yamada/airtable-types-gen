export interface CliOptions {
  baseId?: string;
  output?: string;
  flatten?: boolean;
  tables?: string[];
  help?: boolean;
  version?: boolean;
}

export const parseArguments = (args: string[]): CliOptions => {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--base-id':
      case '-b':
        if (nextArg && !nextArg.startsWith('-')) {
          options.baseId = nextArg;
          i++;
        }
        break;

      case '--output':
      case '-o':
        if (nextArg && !nextArg.startsWith('-')) {
          options.output = nextArg;
          i++;
        }
        break;

      case '--flatten':
      case '-f':
        options.flatten = true;
        break;

      case '--tables':
      case '-t':
        if (nextArg && !nextArg.startsWith('-')) {
          options.tables = nextArg.split(',').map((t) => t.trim());
          i++;
        }
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;

      case '--version':
      case '-v':
        options.version = true;
        break;
    }
  }

  return options;
};

export const printHelp = (): void => {
  const help = `
airtable-types-gen - Generate TypeScript types from Airtable base schemas

USAGE:
  airtable-types-gen [OPTIONS]

EXAMPLES:
  # Generate types and output to stdout
  airtable-types-gen --base-id appXXXXXXXX > types.ts
  
  # Generate types with flatten support
  airtable-types-gen --base-id appXXXXXXXX --flatten --output types.ts
  
  # Generate types for specific tables only
  airtable-types-gen --base-id appXXXXXXXX --tables "Users,Projects" --output types.ts

OPTIONS:
  -b, --base-id <ID>       Airtable base ID (required)
  -o, --output <FILE>      Output file (optional, defaults to stdout)
  -f, --flatten           Generate types with flatten support
  -t, --tables <NAMES>    Comma-separated list of table names to include
  -h, --help              Show this help message
  -v, --version           Show version information

ENVIRONMENT VARIABLES:
  AIRTABLE_PERSONAL_TOKEN  Your Airtable personal access token (required)
  AIRTABLE_BASE_ID        Default base ID if --base-id is not provided

For more information, visit: https://github.com/username/airtable-types-gen
`;

  console.log(help);
};

export const printVersion = (): void => {
  // This will be replaced during build with actual version from package.json
  console.log('0.1.1');
};
