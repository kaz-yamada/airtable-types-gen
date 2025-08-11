# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-08-11

### Fixed

- **Repository URL**: Fixed repository URL in package.json (was pointing to placeholder `username/airtable-types-gen`)
- **Version Display**: Updated CLI version display to correctly show 0.1.1
- **Types Generation**: Fixed major issues in TypeScript interface generation:
  - Fixed literal `\n` escape sequences appearing in generated output
  - Fixed string escaping issues in interface generation (proper quote escaping)
  - Improved property name conflict resolution logic
  - Better handling of readonly and optional field detection

### Added

- **Dual Mode Support**: Added comprehensive support for both flattened and native Airtable record structures:
  - Flattened mode: Direct field access (`record.Name` instead of `record.fields.Name`) 
  - Native mode: Standard Airtable structure with separate `fields` object and `createdTime`
- **Enhanced Interface Generation**: 
  - Added proper JSDoc headers for all generated interfaces with table descriptions
  - Improved field documentation with clean description handling (removes line breaks)
  - Better property spacing and formatting in generated code
  - Smart property naming with advanced conflict resolution for edge cases
- **Advanced Utility Types**:
  - Separate utility types for flattened vs native modes
  - Enhanced CRUD types (`CreateRecord`, `UpdateRecord`, `ReadRecord`) with proper structure
  - Added `GetTableFields<T>` type for extracting field types from records
  - Flattened mode includes `FlattenedRecord` interface and re-exports `flattenRecord` function
  - Proper TypeScript generics for complete type safety
- **Test Coverage**: Added regression test to prevent literal escape sequence issues in output

### Changed

- **Interface Structure**: Major refactoring of interface generation logic:
  - Flattened mode now uses `record_id` instead of `id` to avoid field name conflicts
  - Native mode preserves standard Airtable structure (`id`, `fields`, `createdTime`)
  - Improved property spacing and formatting in generated interfaces
  - Better separation between Fields interface and main Record interface in native mode
- **Build Configuration**: Updated .gitignore to exclude `.github/` directory from version control
- **Code Quality**: Significant improvements to type generation logic:
  - Complete rewrite of `generateTableInterface()` with mode-specific logic
  - Improved string handling and escaping throughout the generator
  - Enhanced conflict resolution for property names (especially `id` field variants)
  - Better separation of concerns between flattened and native utility type generation

### Technical Details

- **Breaking Change in Flattened Mode**: Field access uses `record_id` instead of `id` for the Airtable record identifier
- **Improved Output Quality**: Generated TypeScript code now has proper formatting and no escape sequence artifacts
- **Enhanced Type Safety**: Better utility types that correctly reflect the actual data structures returned by Airtable API
- **Test Coverage**: Added specific test case to prevent regression of newline escape sequence issues

### Migration Notes

If upgrading from 0.1.0 and using flattened mode, update your code to use `record_id` instead of `id` when accessing the Airtable record identifier in flattened records.

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
