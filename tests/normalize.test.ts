import { expect, describe, it } from 'vitest';
import { normalize } from '../src/options.js';

describe('normalize function', () => {
  describe('default values', () => {
    it('should return default options when called with no arguments', () => {
      const result = normalize();

      expect(result).toEqual({
        suffixes: ['.ts', '.tsx', '.mts', '.cts'],
        files: [],
        excludedDirectories: ['.git', 'test', 'tests', 'dist', 'node_modules'],
        skipDts: true,
      });
    });

    it('should return default options when called with empty object', () => {
      const result = normalize({});

      expect(result).toEqual({
        suffixes: ['.ts', '.tsx', '.mts', '.cts'],
        files: [],
        excludedDirectories: ['.git', 'test', 'tests', 'dist', 'node_modules'],
        skipDts: true,
      });
    });
  });

  describe('custom suffixes', () => {
    it('should accept custom suffixes array', () => {
      const result = normalize({ suffixes: ['.ts', '.js'] });

      expect(result.suffixes).toEqual(['.ts', '.js']);
    });

    it('should throw error for invalid suffixes (not array)', () => {
      expect(() => normalize({ suffixes: 'invalid' as any })).toThrow(
        'Expected suffixes to be string[]'
      );
    });

    it('should throw error for invalid suffixes (array with non-strings)', () => {
      expect(() => normalize({ suffixes: ['.ts', 123, '.tsx'] as any })).toThrow(
        'Expected suffixes to be string[]'
      );
    });
  });

  describe('custom files', () => {
    it('should accept custom files array', () => {
      const result = normalize({ files: ['src/types.ts', 'src/enums.ts'] });

      expect(result.files).toEqual(['src/types.ts', 'src/enums.ts']);
    });

    it('should throw error for invalid files (not array)', () => {
      expect(() => normalize({ files: 'invalid' as any })).toThrow('Expected files to be string[]');
    });

    it('should throw error for invalid files (array with non-strings)', () => {
      expect(() => normalize({ files: ['valid.ts', null] as any })).toThrow(
        'Expected files to be string[]'
      );
    });
  });

  describe('custom excludedDirectories', () => {
    it('should accept custom excludedDirectories array', () => {
      const result = normalize({ excludedDirectories: ['node_modules', 'build'] });

      expect(result.excludedDirectories).toEqual(['node_modules', 'build']);
    });

    it('should throw error for invalid excludedDirectories (not array)', () => {
      expect(() => normalize({ excludedDirectories: 'invalid' as any })).toThrow(
        'Expected excludedDirectories to be string[]'
      );
    });

    it('should throw error for invalid excludedDirectories (array with non-strings)', () => {
      expect(() => normalize({ excludedDirectories: ['node_modules', {}] as any })).toThrow(
        'Expected excludedDirectories to be string[]'
      );
    });
  });

  describe('skipDts option', () => {
    it('should accept skipDts as true', () => {
      const result = normalize({ skipDts: true });

      expect(result.skipDts).toBe(true);
    });

    it('should accept skipDts as false', () => {
      const result = normalize({ skipDts: false });

      expect(result.skipDts).toBe(false);
    });
  });

  describe('combined options', () => {
    it('should handle multiple custom options together', () => {
      const result = normalize({
        suffixes: ['.ts'],
        files: ['custom.ts'],
        excludedDirectories: ['build'],
        skipDts: false,
      });

      expect(result).toEqual({
        suffixes: ['.ts'],
        files: ['custom.ts'],
        excludedDirectories: ['build'],
        skipDts: false,
      });
    });

    it('should merge partial options with defaults', () => {
      const result = normalize({
        suffixes: ['.ts'],
      });

      expect(result).toEqual({
        suffixes: ['.ts'],
        files: [],
        excludedDirectories: ['.git', 'test', 'tests', 'dist', 'node_modules'],
        skipDts: true,
      });
    });
  });
});
