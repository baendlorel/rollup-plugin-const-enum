# Changelog

## [1.1.3] [1.1.4]

- Fix issue the `__kskb_replacement_list` property is mangled by terser.
- Fix the description in comments

## [1.1.2]

- Share the internal replacement list for users. Accessed by `constEnum().__kskb_replacement_list`

## [1.1.1]

- Add link to other plugins

## [1.1.0]

### Changed

- Switched to pure RegExp-based replacement for all enum member inlining.
- Removed all usage and references to String.prototype.replaceAll and related polyfills.
- Codebase further simplified and modernized.
- Fixed test errors caused by sorting key changes.
- Migrated build script to TypeScript.
- Optimized node_modules path lookup to avoid self-import conflicts.

## [1.0.3] - 2025-10-05

### Added

- Added mangle option, further reduced bundle size (4.4k → 3.19k).

### Fixed

- Fixed issue where plugin could not inline itself (State changed to const enum).
- Fixed options not updating.

### Changed

- Simplified array assertions.
- Released 1.0.3.

## [1.0.2] - 2025-10-05

### Fixed

- Fixed options not updating in time.
- Released 1.0.2.

## [1.0.0] - 2025-10-05

### Added

- Official release 1.0.0.
- Basic error handling fixed.

## [0.0.5] - 2025-10-05

### Fixed

- Fixed enum replacement order bug (short key replaced before long key, causing errors).

## [0.0.4] - 2025-10-05

### Changed

- No longer mangle output.

## [0.0.3] - 2025-10-05

### Changed

- Changed to return `{ code, map }` object.

## [0.0.2] - 2025-10-05

### Changed

- Changed to default export.

---

> For more historical changes, please refer to git log.
