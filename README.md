## rollup-plugin-const-enum

[![npm version](https://img.shields.io/npm/v/rollup-plugin-const-enum.svg)](https://www.npmjs.com/package/rollup-plugin-const-enum) [![npm downloads](http://img.shields.io/npm/dm/rollup-plugin-const-enum.svg)](https://npmcharts.com/compare/rollup-plugin-const-enum,token-types?start=1200&interval=30)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/59dd6795e61949fb97066ca52e6097ef)](https://www.codacy.com/app/Borewit/rollup-plugin-const-enum?utm_source=github.com&utm_medium=referral&utm_content=Borewit/rollup-plugin-const-enum&utm_campaign=Badge_Grade)

A tiny Rollup plugin that inlines TypeScript `const enum` members by simple text replacement. (for example `Colors.Red` -> `0` or `Consts.Key` -> `"val"`).

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

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
    // other plugins
  ],
};
```

## Options

You can pass a partial options object to `constEnum(options)` where the main knobs are filters.

Defaults (approx):

- constEnumInclude: ['src/⋆⋆/⋆.ts', 'src/⋆⋆/⋆.tsx', 'src/⋆⋆/⋆.mts'] (files scanned to build the enum map)
- constEnumExclude: ['⋆⋆/⋆.d.ts', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']
- include: ['src/⋆⋆/⋆.ts', 'src/⋆⋆/⋆.tsx', 'src/⋆⋆/⋆.mts'] (files transformed)
- exclude: ['⋆⋆/⋆.d.ts', 'test/⋆⋆', 'tests/⋆⋆', 'dist/⋆⋆', 'node_modules/⋆⋆']

Example:

```js
import { constEnum } from 'rollup-plugin-const-enum';

export default {
  plugins: [
    constEnum({
      // transform only files in lib/ instead of src/
      include: ['lib/**/*.js'],
      // scan a different set of source files for const enums
      constEnumInclude: ['src/**/*.ts'],
    }),
  ],
};
```

## Limitations / Important notes

- This plugin does not use any AST transformer.
- Replacements are based on the textual key `EnumName.Member`.
- Only supports for simple cases. Ambigous, expressions are not supported.

## License

MIT
