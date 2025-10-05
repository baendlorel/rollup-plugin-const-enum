import { expect, describe, it } from 'vitest';
import { constEnum } from '../src/index.js';
import { createTestEnvironment, sampleEnums, simulateTransform } from './helpers.js';

describe('constEnum plugin integration', () => {
  describe('plugin creation', () => {
    it('should create plugin with default options', () => {
      const plugin = constEnum();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('__NAME__');
      expect(plugin.transform).toBeDefined();
    });

    it('should create plugin with custom options', () => {
      const plugin = constEnum({
        suffixes: ['.ts'],
        skipDts: false,
      });

      expect(plugin).toBeDefined();
      expect(plugin.transform).toBeDefined();
    });
  });

  describe('transform function', () => {
    it('should replace const enum references with literal values', () => {
      const plugin = constEnum({
        files: ['tests/enums.ts'],
      });

      const code = 'const color = Color.Red;';
      const transformed = (plugin.transform as Function)(code);

      expect(transformed).toBe('const color = 0;');
    });

    it('should replace multiple enum references', () => {
      const testEnv = createTestEnvironment('plugin-multiple-' + Date.now());
      testEnv.writeFile('enums.ts', sampleEnums.simple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['enums.ts'],
        });

        const code = `
const red = Colors.Red;
const green = Colors.Green;
const blue = Colors.Blue;
`;
        const result = simulateTransform(plugin, code);

        expect(result).toContain('const red = 0;');
        expect(result).toContain('const green = 1;');
        expect(result).toContain('const blue = 2;');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should replace string enum values', () => {
      const testEnv = createTestEnvironment('plugin-string-' + Date.now());
      testEnv.writeFile('status.ts', sampleEnums.stringEnum);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['status.ts'],
        });

        const code = 'const status = Status.Active;';
        const result = simulateTransform(plugin, code);

        expect(result).toBe('const status = "active";');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle enum references in expressions', () => {
      const testEnv = createTestEnvironment('plugin-expression-' + Date.now());
      testEnv.writeFile('enums.ts', sampleEnums.simple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['enums.ts'],
        });

        const code = 'const sum = Colors.Red + Colors.Blue;';
        const result = simulateTransform(plugin, code);

        expect(result).toBe('const sum = 0 + 2;');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle multiple enums from different files', () => {
      const testEnv = createTestEnvironment('plugin-multi-files-' + Date.now());
      testEnv.writeFile('colors.ts', sampleEnums.simple);
      testEnv.writeFile('status.ts', sampleEnums.stringEnum);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['colors.ts', 'status.ts'],
        });

        const code = `
const color = Colors.Red;
const status = Status.Active;
`;
        const result = simulateTransform(plugin, code);

        expect(result).toContain('const color = 0;');
        expect(result).toContain('const status = "active";');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should return null when no replacements are needed', () => {
      const testEnv = createTestEnvironment('plugin-no-replace-' + Date.now());
      testEnv.writeFile('enums.ts', sampleEnums.simple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['enums.ts'],
        });

        const code = 'const x = 42;'; // No enum references
        const result = simulateTransform(plugin, code);

        expect(result).toBeNull();
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should return null when no const enums found', () => {
      const testEnv = createTestEnvironment('plugin-no-enums-' + Date.now());
      testEnv.writeFile('regular.ts', 'const x = 1;');

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['regular.ts'],
        });

        const code = 'const y = 2;';
        const result = simulateTransform(plugin, code);

        expect(result).toBeNull();
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle complex code with multiple references', () => {
      const testEnv = createTestEnvironment('plugin-complex-' + Date.now());
      testEnv.writeFile('enums.ts', sampleEnums.multiple);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['enums.ts'],
        });

        const code = `
function test() {
  const a = First.A;
  const b = First.B;
  const x = Second.X;
  const y = Second.Y;
  return a + b;
}
`;
        const result = simulateTransform(plugin, code);

        expect(result).toContain('const a = 1;');
        expect(result).toContain('const b = 2;');
        expect(result).toContain('const x = "x";');
        expect(result).toContain('const y = "y";');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should not replace partial matches', () => {
      const testEnv = createTestEnvironment('plugin-partial-' + Date.now());
      testEnv.writeFile(
        'enums.ts',
        `
const enum Colors {
  Red = 0
}
      `
      );

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['enums.ts'],
        });

        // These should not be replaced
        const code = `
const MyColors = { Red: 1 };
const ColorsRed = 2;
const x = Colors.Red;
`;
        const result = simulateTransform(plugin, code);

        // Only Colors.Red should be replaced
        expect(result).toContain('const MyColors = { Red: 1 };');
        expect(result).toContain('const ColorsRed = 2;');
        expect(result).toContain('const x = 0;');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should work with directory scanning', () => {
      const testEnv = createTestEnvironment('plugin-scan-dir-' + Date.now());
      // Create files in src directory
      testEnv.writeFile('src/colors.ts', sampleEnums.simple);
      testEnv.writeFile('src/status.ts', sampleEnums.stringEnum);

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: [], // Empty files array triggers directory scan
          excludedDirectories: ['node_modules', 'dist'],
        });

        const code = `
const color = Colors.Red;
const status = Status.Active;
`;
        const result = simulateTransform(plugin, code);

        expect(result).toContain('const color = 0;');
        expect(result).toContain('const status = "active";');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle enums with no members', () => {
      const testEnv = createTestEnvironment('plugin-empty-enum-' + Date.now());
      testEnv.writeFile(
        'empty-enum.ts',
        `
const enum Empty {
}
      `
      );

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['empty-enum.ts'],
        });

        const code = 'const x = 1;';
        const result = simulateTransform(plugin, code);

        expect(result).toBeNull();
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle hex numbers correctly', () => {
      const testEnv = createTestEnvironment('plugin-hex-' + Date.now());
      testEnv.writeFile(
        'hex.ts',
        `
const enum Flags {
  A = 0x01,
  B = 0x02,
  C = 0x04
}
      `
      );

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['hex.ts'],
        });

        const code = 'const flag = Flags.A | Flags.B;';
        const result = simulateTransform(plugin, code);

        expect(result).toContain('0x01');
        expect(result).toContain('0x02');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });

    it('should handle auto-increment after numeric values', () => {
      const testEnv = createTestEnvironment('plugin-auto-inc-' + Date.now());
      testEnv.writeFile(
        'auto.ts',
        `
const enum Numbers {
  A = 10,
  B,
  C,
  D = 20,
  E
}
      `
      );

      const originalCwd = process.cwd();
      process.chdir(testEnv.dir);

      try {
        const plugin = constEnum({
          files: ['auto.ts'],
        });

        const code = `
const a = Numbers.A;
const b = Numbers.B;
const c = Numbers.C;
const d = Numbers.D;
const e = Numbers.E;
`;
        const result = simulateTransform(plugin, code);

        expect(result).toContain('const a = 10;');
        expect(result).toContain('const b = 11;');
        expect(result).toContain('const c = 12;');
        expect(result).toContain('const d = 20;');
        expect(result).toContain('const e = 21;');
      } finally {
        process.chdir(originalCwd);
        testEnv.cleanup();
      }
    });
  });
});
