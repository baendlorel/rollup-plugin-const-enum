## rollup-plugin-const-enum

[![npm version](https://img.shields.io/npm/v/rollup-plugin-const-enum.svg)](https://www.npmjs.com/package/rollup-plugin-const-enum) [![npm downloads](http://img.shields.io/npm/dm/rollup-plugin-const-enum.svg)](https://npmcharts.com/compare/rollup-plugin-const-enum,token-types?start=1200&interval=30)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/59dd6795e61949fb97066ca52e6097ef)](https://www.codacy.com/app/Borewit/rollup-plugin-const-enum?utm_source=github.com&utm_medium=referral&utm_content=Borewit/rollup-plugin-const-enum&utm_campaign=Badge_Grade)

A tiny Rollup plugin that inlines TypeScript `const enum` members by simple RegExp-based text replacement. (for example `Colors.Red` -> `0` or `Consts.Key` -> `"val"`).

> This plugin will replace all occurrences of `EnumName.Member` in the source files (be aware of the name collision!), then the import statements will be removed by Rollup's tree-shaking.

**More Rollup Plugins** you might be interested in:

- [rollup-plugin-conditional-compilation](https://www.npmjs.com/package/rollup-plugin-conditional-compilation): Use directives like `// #if`, `// #else` to do the conditional compilation like C++.
- [rollup-plugin-const-enum](https://www.npmjs.com/package/rollup-plugin-const-enum): inline your `const enum XXX { ... }` definitions at compile time.
- [rollup-plugin-func-macro](https://www.npmjs.com/package/rollup-plugin-func-macro): replace `__func__` by function name of current block, and `__file__` by file name at compile time.

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

[ChangeLog](CHANGELOG.md)

## Install

Use pnpm to install as a devDependency:

```bash
pnpm add -D rollup-plugin-const-enum
```

## Quick usage

Place the plugin in your Rollup config (near the front of the plugin list is recommended):

```js
import { constEnum } from 'rollup-plugin-const-enum';

export default {
  // ...
  plugins: [
    constEnum(), // place it near the front
    ...
  ],
};
```

## Options

The plugin accepts an optional options object. All options are optional and have sensible defaults.

- `suffixes: string[]` — File suffixes to include when scanning the project for const enums. Default: `['.ts', '.tsx', '.mts', '.cts']`.
- `files: string[]` — Explicit list of file paths (relative to `process.cwd()`) to scan for `const enum` declarations. When this array is non-empty the plugin will only use these files (each path is resolved with `path.join(process.cwd(), file)`) and will ignore recursive directory collection. Default: `[]` (scan the project tree).
- `excludedDirectories: string[]` — Directory names (relative to the project root) to exclude from recursive scanning. Each name is resolved against `process.cwd()`. Default: `['.git', 'test', 'tests', 'dist', 'node_modules']`.
- `skipDts: boolean` — When `true`, files ending with `.d.ts` are ignored. Default: `true`.

Validation: `suffixes`, `files`, and `excludedDirectories` must be arrays of strings. Passing invalid types will throw a `TypeError` during plugin initialization.

### Example

```js
import constEnum from 'rollup-plugin-const-enum';

export default {
  plugins: [
    constEnum({
      suffixes: ['.ts', '.tsx'],
      files: ['src/index.ts'],
      excludedDirectories: ['.git', 'node_modules'],
      skipDts: true,
    }),
  ],
};
```

## Important notes

- Scans and collects all const enums and applies them to every included file.
  - Cannot scan a specific file and apply it to another specific file.
- This plugin does not use any AST transformer.
- Replacements are based on the textual key `EnumName.Member` using RegExp.
- Only supports simple cases. Ambiguous or complex expressions are not supported.

## Advanced Usage

You can access the internal replacement list (for advanced use cases) via the plugin instance:

```ts
const plugin = constEnum();
const list = plugin.__kskb_replacement_list; // [ [RegExp, [ [key, value], ... ] ], ... ]
```

## License

MIT
