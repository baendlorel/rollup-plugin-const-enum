Evaluation of src/ (rollup-plugin-const-enum)

Summary
-------
This plugin scans TypeScript files for `const enum` declarations using regular expressions, builds a mapping from fully-qualified enum members (e.g. `Enum.Member`) to literal values, and performs simple textual replacements during the Rollup `transform` hook using `String.prototype.replaceAll`.

Overall this is a small, pragmatic approach that is easy to understand and fast for many simple projects. However, the implementation has several correctness and safety limitations because it operates purely on text rather than on a JS/TS AST or tokens.

Key findings
------------
- Global mutation: the plugin polyfills `String.prototype.replaceAll` on module load. Mutating built-ins is risky and can cause conflicts in other code or test environments.

- Regex parser brittleness: `parseConstEnums` uses regex-based parsing for `const enum` bodies. This is fragile for real-world TS source (nested braces in comments, tricky spacing, edge-case initializers, template literals inside comments, etc.).

- File-set mismatch: defaults between the options (`constEnumInclude` accepts `*.mts`) and the file collector (`collectTsFiles` only collects `.ts` and `.tsx`) are inconsistent. This can result in surprising missing enums.

- Replacement safety: replacements are performed by simple `replaceAll` across the whole source text. This will replace matches inside string literals, template literals, comments, or other unintended contexts. That can break code in subtle ways.

- Initialization handling: the parser handles string literals and simple numeric literals (including hex) and implicit numeric sequencing, but other expressions are left as raw text and substituted verbatim. This may cause invalid code after replacement if the initializer contains references or complex expressions.

- Performance: the plugin builds a replacer list and iterates through all replacers doing repeated replaceAll calls. For large maps this can be inefficient (O(n*m) behavior across replacers * file size).

- Plugin name placeholder: `index.ts` uses a placeholder name `__NAME__` for the Rollup plugin. Consider using the package name or a constant.

Concrete recommendations
----------------------
1) Avoid mutating built-ins
   - Remove the global `String.prototype.replaceAll` polyfill. Use a local helper function instead, e.g. `function replaceAll(str, search, replace) { return str.split(search).join(replace); }`.

2) Improve parsing reliability
   - Prefer TypeScript Compiler API or ts-morph for parsing `const enum` declarations and evaluating simple initializers safely. This will correctly handle comments, complex initializers, computed members, and declaration merging semantics.
   - If you want to stay dependency-free, implement a minimal lexer to skip string/comment ranges before running the regex, or at least extend the regex logic and add robust unit tests for edge cases.

3) Make file collection consistent and configurable
   - Either make `collectTsFiles` accept the same globs as `constEnumInclude`, or respect the filter from `normalize` directly when walking files. Consider using `fast-glob` to collect files by glob instead of recursive fs walking.

4) Improve replacement safety
   - Replace only token positions corresponding to member access or identifier usage. Approaches:
     - Parse transformed code to AST (acorn, es-module-lexer + acorn, or TypeScript transformer) and replace only MemberExpression or Identifier nodes.
     - Implement a simple tokenizer to skip string/template/comment ranges so textual replacements won't touch them.
   - Add an option to enable/disable "aggressive" replacement (default: conservative behavior that avoids strings/comments).

5) Performance improvements
   - Build a single regular expression that matches any of the keys (sorted by length) and perform a single pass replace with a callback to map to replacement values. This will reduce repeated full-text scans.
   - For extremely large maps consider a trie-based search or streaming replacement.

6) Better testing
   - Add tests that cover replacements inside strings, templates, and comments, hexadecimal and negative numbers, computed members, and ensuring longer keys win over shorter ones (already covered but add more assertions).
   - Add tests that simulate replacing in non-TS files (JS output) to ensure safety.

7) Packaging and ergonomics
   - Replace `__NAME__` with the package name (readable in code or injected at build time).
   - Add a small CLI or build script to pre-generate the enum map as JSON (optional) so it can be used outside of Rollup or in CI.

Suggested low-risk quick fixes (small PRs)
-----------------------------------------
- Remove global replaceAll polyfill and add a small local helper.
- Fix extension mismatch: include `.mts`/`.cts` in `collectTsFiles` or keep defaults aligned.
- Replace plugin name placeholder with a constant from package.json at build time or hardcode the package name.
- Add unit tests for the tokenizer/skip-strings approach.

Bigger refactors to consider
---------------------------
- Switch to a TypeScript-driven approach (ts-morph or TypeScript Compiler API) for robust enum extraction and evaluation. This removes many edge-case bugs at the cost of a dependency and slightly more complex code.

- Implement AST-based replacement on the transformed JavaScript (or on the TypeScript AST before emit). Replacing at the AST level avoids accidental replacements in strings and comments and is the safest approach.

Checklist for follow-up
-----------------------
- [ ] Remove global polyfill
- [ ] Align file collection globs
- [ ] Add local replace helper or build single-RegExp replacement
- [ ] Add tests for strings/templates/comments and computed enum members
- [ ] Consider TypeScript AST parsing for enum extraction
- [ ] Provide a conservative option to avoid replacements inside strings/comments

Notes
-----
This evaluation focuses on maintainability, correctness and safety trade-offs. The current implementation is understandable and will work well for small, well-scoped projects where developers control the codebase and can restrict the plugin's include globs. For broader adoption or use in complex codebases, moving to AST-based extraction and token-aware replacements is recommended.
