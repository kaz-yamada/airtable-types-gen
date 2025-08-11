import { describe, it, expect } from 'vitest';
import { parseArguments } from '../../src/cli/options';

describe('CLI options parsing', () => {
  it('should parse base-id option', () => {
    const options = parseArguments(['--base-id', 'appTest123']);
    expect(options.baseId).toBe('appTest123');
  });

  it('should parse short base-id option', () => {
    const options = parseArguments(['-b', 'appTest123']);
    expect(options.baseId).toBe('appTest123');
  });

  it('should parse output option', () => {
    const options = parseArguments(['--output', 'types.ts']);
    expect(options.output).toBe('types.ts');
  });

  it('should parse short output option', () => {
    const options = parseArguments(['-o', 'types.ts']);
    expect(options.output).toBe('types.ts');
  });

  it('should parse flatten flag', () => {
    const options = parseArguments(['--flatten']);
    expect(options.flatten).toBe(true);
  });

  it('should parse short flatten flag', () => {
    const options = parseArguments(['-f']);
    expect(options.flatten).toBe(true);
  });

  it('should parse tables option', () => {
    const options = parseArguments(['--tables', 'Users,Projects,Settings']);
    expect(options.tables).toEqual(['Users', 'Projects', 'Settings']);
  });

  it('should parse short tables option', () => {
    const options = parseArguments(['-t', 'Users,Projects']);
    expect(options.tables).toEqual(['Users', 'Projects']);
  });

  it('should parse help flag', () => {
    const options = parseArguments(['--help']);
    expect(options.help).toBe(true);
  });

  it('should parse short help flag', () => {
    const options = parseArguments(['-h']);
    expect(options.help).toBe(true);
  });

  it('should parse version flag', () => {
    const options = parseArguments(['--version']);
    expect(options.version).toBe(true);
  });

  it('should parse short version flag', () => {
    const options = parseArguments(['-v']);
    expect(options.version).toBe(true);
  });

  it('should parse complex command', () => {
    const options = parseArguments([
      '--base-id', 'appTest123',
      '--output', 'src/types.ts',
      '--flatten',
      '--tables', 'Users,Projects'
    ]);

    expect(options).toEqual({
      baseId: 'appTest123',
      output: 'src/types.ts',
      flatten: true,
      tables: ['Users', 'Projects']
    });
  });

  it('should handle empty arguments', () => {
    const options = parseArguments([]);
    expect(options).toEqual({});
  });

  it('should ignore invalid options', () => {
    const options = parseArguments(['--invalid', 'value', '--base-id', 'appTest']);
    expect(options).toEqual({
      baseId: 'appTest'
    });
  });

  it('should handle tables with spaces', () => {
    const options = parseArguments(['--tables', 'User Settings, API Keys, Projects']);
    expect(options.tables).toEqual(['User Settings', 'API Keys', 'Projects']);
  });
});