import { expect, describe, it, vi, beforeEach } from 'vitest';

// Mock the modules that the plugin imports so we can control their behavior.
// We mock ../src/const-enum.js to provide a controllable map and expose a
// setter so tests can change the map between cases. We mock
// ../src/options.js so we can control the include filter returned by
// normalize() via passing special keys in the options argument.
vi.mock('../src/const-enum.js', () => {
  // module-scoped variable holding the current mock map
  let map = new Map<string, string>();
  return {
    buildConstEnumMap: (_include: (id: string) => boolean) => map,
    __setMockMap: (m: Map<string, string>) => {
      map = m;
    },
  };
});

vi.mock('../src/options.js', () => {
  return {
    normalize: (options: any = {}) => {
      // If tests pass `includeMock` or `constEnumIncludeMock` in the
      // options object, use those, otherwise default to a predicate
      // that accepts everything.
      const include = options.includeMock ?? (() => true);
      const constEnumInclude = options.constEnumIncludeMock ?? (() => true);
      return { include, constEnumInclude };
    },
  };
});

import * as constEnumModule from '../src/const-enum.js';
import { constEnum } from '../src/index.js';

describe('constEnum plugin transform', () => {
  beforeEach(() => {
    // reset mock map before each test
    (constEnumModule as any).__setMockMap(new Map());
    vi.clearAllMocks();
  });

  it('replaces enum members with their literal values', () => {
    const m = new Map<string, string>([
      ['Colors.Red', '0'],
      ['Consts.Key', JSON.stringify('val')],
    ]);
    (constEnumModule as any).__setMockMap(m);

    const plugin = constEnum();
    const input = 'const a = Colors.Red; const b = Consts.Key; const c = Colors.Red + Consts.Key;';
    const out = plugin.transform ? (plugin.transform as any)(input, 'file.ts') : null;

    expect(out).toBe('const a = 0; const b = "val"; const c = 0 + "val";');
  });

  it('returns null when include filter excludes the file', () => {
    (constEnumModule as any).__setMockMap(new Map([['A.B', '1']]));
    const plugin = constEnum({ includeMock: (id: string) => false } as any);

    const res = plugin.transform ? (plugin.transform as any)('A.B', 'file.ts') : null;
    expect(res).toBeNull();
  });

  it('returns null when there are no replacers (empty map)', () => {
    (constEnumModule as any).__setMockMap(new Map());
    const plugin = constEnum();

    const res = plugin.transform ? (plugin.transform as any)('Something', 'file.ts') : null;
    expect(res).toBeNull();
  });

  it('replaces longer keys first to avoid partial matches', () => {
    // A.B and A.BC — ensure A.BC becomes the longer replacement, not A.B + 'C'
    (constEnumModule as any).__setMockMap(
      new Map([
        ['A.B', '1'],
        ['A.BC', '2'],
      ])
    );
    const plugin = constEnum();

    const out = plugin.transform ? (plugin.transform as any)('const x = A.BC;', 'file.ts') : null;
    expect(out).toBe('const x = 2;');
  });
});
