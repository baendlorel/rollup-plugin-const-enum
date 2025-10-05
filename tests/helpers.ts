import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Plugin } from 'rollup';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create a temporary test directory with test files
 */
export function createTestEnvironment(testName: string) {
  const testDir = path.join(__dirname, '.temp', testName);

  // Cleanup if exists
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  fs.mkdirSync(testDir, { recursive: true });

  return {
    dir: testDir,
    /**
     * Write a file in the test directory
     */
    writeFile(relativePath: string, content: string) {
      const fullPath = path.join(testDir, relativePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf8');
      return fullPath;
    },
    /**
     * Cleanup the test directory
     */
    cleanup() {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    },
  };
}

/**
 * Simulate plugin transform by applying the plugin's transform function
 */
export function simulateTransform(
  plugin: Plugin,
  code: string,
  id: string = 'test.ts'
): string | null {
  if (!plugin.transform || typeof plugin.transform !== 'function') {
    throw new Error('Plugin does not have a transform function');
  }

  // Call transform with minimal context
  const result = (plugin.transform as any)(code, id);

  if (result === null || result === undefined) {
    return null;
  }

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result === 'object' && 'code' in result) {
    return result.code ?? null;
  }

  return null;
}

/**
 * Sample const enum declarations for testing
 */
export const sampleEnums = {
  simple: `
const enum Colors {
  Red = 0,
  Green = 1,
  Blue = 2
}`,
  stringEnum: `
export const enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}`,
  mixed: `
declare const enum Mixed {
  A = 1,
  B = "string",
  C = 0x10,
  D
}`,
  multiple: `
const enum First {
  A = 1,
  B = 2
}

const enum Second {
  X = "x",
  Y = "y"
}`,
  withComments: `
const enum Status {
  /* This is a comment */
  Active = 1,
  // Another comment
  Inactive = 0
}`,
  final: `
const enum Status {/* This is a comment */Active,BAKDB,/* '''43This is a comment */KDJF,
  // Another comment
  Inactive = '23'
}`,
  error: `
const enum Status {
  a = '23',b
}`,
};

/**
 * Sample code that uses const enums
 */
export const sampleUsage = {
  simple: `
const color = Colors.Red;
const active = Status.Active;`,
  expression: `
const value = Colors.Red + Colors.Blue;
const text = "Status: " + Status.Active;`,
  complex: `
function getColor(type: string) {
  if (type === 'primary') {
    return Colors.Red;
  }
  return Colors.Blue;
}

const statuses = [Status.Active, Status.Inactive];`,
};
