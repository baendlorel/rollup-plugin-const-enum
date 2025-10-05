import { expect, describe, it } from 'vitest';
import constEnum from '../src/index.js';

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
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const color = Color.Red;';
      const result = (plugin.transform as Function)(code);

      expect(result.code).toBe('const color = 0;');
    });

    it('should replace multiple enum references', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = `const red = Color.Red;
                      const green = Color.Green;
                      const blue = Color.Blue; `;
      const result = (plugin.transform as Function)(code);

      expect(result.code).toContain('const red = 0;');
      expect(result.code).toContain('const green = 1;');
      expect(result.code).toContain('const blue = 2;');
    });

    it('should replace string enum values', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const status = Status.Active;';
      const result = (plugin.transform as Function)(code);

      expect(result.code).toBe('const status = "active";');
    });

    it('should handle enum references in expressions', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const sum = Color.Red + Color.Blue;';
      const result = (plugin.transform as Function)(code);

      expect(result.code).toBe('const sum = 0 + 2;');
    });

    it('should handle multiple enums from different files', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = `const color = Color.Red;
                    const status = Status.Active;`;
      const result = (plugin.transform as Function)(code);

      expect(result.code).toContain('const color = 0;');
      expect(result.code).toContain('const status = "active";');
    });

    it('should return null when no replacements are needed', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const x = 42;'; // No enum references
      const result = (plugin.transform as Function)(code);

      expect(result).toBeNull();
    });

    it('should return null when no const enums found', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const y = 2;';
      const result = (plugin.transform as Function)(code);

      expect(result).toBeNull();
    });

    it('should handle complex code with multiple references', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = `function test() {
                      const a = First.A;
                      const b = First.B;
                      const x = Second.X;
                      const y = Second.Y;
                      return a + b;
                    }`;
      const result = (plugin.transform as Function)(code);

      expect(result.code).toContain('const a = 1;');
      expect(result.code).toContain('const b = 2;');
      expect(result.code).toContain('const x = "x";');
      expect(result.code).toContain('const y = "y";');
    });

    it('should not replace partial matches', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      // These should not be replaced
      const code = `
const MyColor = { Red: 1 };
const ColorRed = 2;
const x = Color.Red;
`;
      const result = (plugin.transform as Function)(code);

      // Only Color.Red should be replaced
      expect(result.code).toContain('const MyColor = { Red: 1 };');
      expect(result.code).toContain('const ColorRed = 2;');
      expect(result.code).toContain('const x = 0;');
    });
  });

  describe('edge cases', () => {
    it('should handle hex numbers correctly', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = 'const flag = Flags.A | Flags.B;';
      const result = (plugin.transform as Function)(code);

      expect(result.code).toContain('0x01');
      expect(result.code).toContain('0x02');
    });

    it('should handle auto-increment after numeric values', () => {
      const plugin = constEnum({ files: ['tests/enums.ts'] });

      const code = `
const a = Numbers.A;
const b = Numbers.B;
const c = Numbers.C;
const d = Numbers.D;
const e = Numbers.E;
`;
      const result = (plugin.transform as Function)(code);

      expect(result.code).toContain('const a = 10;');
      expect(result.code).toContain('const b = 11;');
      expect(result.code).toContain('const c = 12;');
      expect(result.code).toContain('const d = 20;');
      expect(result.code).toContain('const e = 21;');
    });
  });
});
