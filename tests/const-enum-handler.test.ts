import { expect, describe, it } from 'vitest';
import { ConstEnumHandler } from '../src/const-enum.js';
import { normalize } from '../src/options.js';
import { createTestEnvironment, sampleEnums } from './helpers.js';

describe('ConstEnumHandler class', () => {
  describe('buildConstEnumList', () => {
    it('should parse simple numeric const enum', () => {
      const testEnv = createTestEnvironment('test-simple-numeric-' + Date.now());
      testEnv.writeFile('types.ts', sampleEnums.simple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['types.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(1);
        expect(result[0][0]).toBeInstanceOf(RegExp);
        expect(result[0][1]).toEqual([
          ['Colors.Green', '1'],
          ['Colors.Blue', '2'],
          ['Colors.Red', '0'],
        ]);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should parse string const enum', () => {
      const testEnv = createTestEnvironment('test-string-enum-' + Date.now());
      testEnv.writeFile('status.ts', sampleEnums.stringEnum);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['status.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(1);
        expect(result[0][1]).toEqual([
          ['Status.Inactive', '"inactive"'],
          ['Status.Pending', '"pending"'],
          ['Status.Active', '"active"'],
        ]);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should parse mixed value const enum', () => {
      const testEnv = createTestEnvironment('test-mixed-' + Date.now());
      testEnv.writeFile('mixed.ts', sampleEnums.mixed);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['mixed.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(1);
        expect(result[0][1]).toContainEqual(['Mixed.A', '1']);
        expect(result[0][1]).toContainEqual(['Mixed.B', '"string"']);
        expect(result[0][1]).toContainEqual(['Mixed.C', '0x10']);
        // D should be auto-incremented after C (0x10 + 1 = 17)
        expect(result[0][1]).toContainEqual(['Mixed.D', '17']);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should parse multiple const enums in one file', () => {
      const testEnv = createTestEnvironment('test-multiple-' + Date.now());
      testEnv.writeFile('multiple.ts', sampleEnums.multiple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['multiple.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(2);

        // Find First and Second enums
        const firstEnum = result.find((entry) =>
          entry[1].some(([key]) => key.startsWith('First.'))
        );
        const secondEnum = result.find((entry) =>
          entry[1].some(([key]) => key.startsWith('Second.'))
        );

        expect(firstEnum).toBeDefined();
        expect(firstEnum![1]).toEqual([
          ['First.A', '1'],
          ['First.B', '2'],
        ]);

        expect(secondEnum).toBeDefined();
        expect(secondEnum![1]).toEqual([
          ['Second.X', '"x"'],
          ['Second.Y', '"y"'],
        ]);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle const enums with comments', () => {
      const testEnv = createTestEnvironment('test-comments-' + Date.now());
      testEnv.writeFile('commented.ts', sampleEnums.withComments);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['commented.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(1);
        // Should only parse Active and Inactive, not the comment text
        expect(result[0][1]).toHaveLength(2);
        expect(result[0][1]).toContainEqual(['Status.Active', '1']);
        expect(result[0][1]).toContainEqual(['Status.Inactive', '0']);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should collect from multiple files', () => {
      const testEnv = createTestEnvironment('test-multi-files-' + Date.now());
      testEnv.writeFile('file1.ts', sampleEnums.simple);
      testEnv.writeFile('file2.ts', sampleEnums.stringEnum);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['file1.ts', 'file2.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(2);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should include .d.ts files when skipDts is false', () => {
      const testEnv = createTestEnvironment('test-include-dts-' + Date.now());
      testEnv.writeFile('types.d.ts', sampleEnums.simple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['types.d.ts'],
          skipDts: false,
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(1);
        expect(result[0][1][0][0]).toContain('Colors.');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should return empty array when no const enums found', () => {
      const testEnv = createTestEnvironment('test-no-enums-' + Date.now());
      testEnv.writeFile('empty.ts', 'const x = 1; export default x;');

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['empty.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle non-existent files gracefully', () => {
      const testEnv = createTestEnvironment('test-non-existent-' + Date.now());
      // Ensure test directory exists
      testEnv.writeFile('.placeholder', '');

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: ['non-existent.ts'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        expect(result).toHaveLength(0);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should scan directory when files option is empty', () => {
      const testEnv = createTestEnvironment('test-scan-dir-' + Date.now());
      // Create files in the test directory
      testEnv.writeFile('src/types.ts', sampleEnums.simple);
      testEnv.writeFile('src/status.ts', sampleEnums.stringEnum);
      testEnv.writeFile('node_modules/lib.ts', sampleEnums.mixed);

      // Change working directory temporarily
      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const options = normalize({
          files: [],
          excludedDirectories: ['node_modules'],
        });

        const handler = new ConstEnumHandler(options);
        const result = handler.build();

        // Should find files in src/ but not in node_modules/
        expect(result.length).toBeGreaterThan(0);

        // Verify it's from src directory
        const hasColors = result.some((entry) =>
          entry[1].some(([key]) => key.startsWith('Colors.'))
        );
        const hasStatus = result.some((entry) =>
          entry[1].some(([key]) => key.startsWith('Status.'))
        );

        expect(hasColors).toBe(true);
        expect(hasStatus).toBe(true);
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });
  });
});
