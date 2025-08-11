# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-08-11

### Added

- Initial release of airtable-types-gen
- CLI tool inspired by Supabase type generation
- Smart TypeScript type generation from Airtable schemas
- Support for 32+ Airtable field types
- Computed field detection and readonly marking
- Property name conflict resolution
- Record flattening utilities (`flattenRecord`, `flattenRecords`)
- Optional flatten support via `--flatten` flag
- Table filtering via `--tables` option
- Comprehensive test suite with Vitest
- Utility types for CRUD operations
- Union types for single/multiple select fields
- JSDoc comments with field descriptions
- Support for stdout output (Supabase-style)

### Features

- **CLI**: Simple command-line interface with Supabase-inspired syntax
- **Type Safety**: Strongly typed interfaces with proper optional handling
- **Smart Detection**: Automatic computed field detection and readonly marking
- **Utilities**: Record flattening for easier data manipulation
- **Flexibility**: Optional table filtering and output destinations
- **Documentation**: Comprehensive README with examples and integration guides
