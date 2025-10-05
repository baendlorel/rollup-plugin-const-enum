# I made a plugin to inline const enums

Some time ago I tried using `tsdown`, but discovered its const enums are not inlined and there's already an open issue about it. I thought it was a problem specific to that project — but it turns out Rollup's `@rollup/plugin-typescript` behaves the same way(Since its README.md file said so).

So I made a plugin, `rollup-plugin-const-enum` (see the README: https://github.com/baendlorel/rollup-plugin-const-enum). It finds all const enum declarations using regular expressions and then replaces their usages throughout the code. To keep the plugin lightweight I avoided using an AST parser; instead I rely on regexes and a character-by-character scanner to strip comments and detect const enum declarations.

```bash
# installation
pnpm i -D rollup-plugin-const-enum
```

Just use it like this — I already use it in my own projects and it works nicely 😀:

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

If you like this plugin, you might also be interested in another plugin I wrote called `rollup-plugin-func-macro`. That one uses an AST parser and replaces every `__func__` occurrence with the name of the function the code is currently inside.
