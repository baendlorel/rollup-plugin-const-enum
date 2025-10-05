import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { RollupConstEnumOptions } from './types/global.js';
import { stripComment } from './strip-comment.js';

export class ConstEnumHandler {
  private readonly _cwd = process.cwd();
  private readonly _excludedDirs: string[];
  constructor(private readonly _options: RollupConstEnumOptions) {
    this._excludedDirs = this._options.excludedDirectories.map((d) => join(this._cwd, d));
  }

  private _includeFile(s: string) {
    if (this._options.skipDts && s.endsWith('.d.ts')) {
      return false;
    }
    return this._options.suffixes.some((suffix) => s.endsWith(suffix));
  }

  private _filesInOption() {
    const files = this._options.files.map((f) => join(this._cwd, f));
    return files.filter((f) => existsSync(f) && statSync(f).isFile());
  }

  private _collect(dir: string): string[] {
    const out: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (this._excludedDirs.includes(full)) {
          continue;
        }
        out.push(...this._collect(full));
      } else if (e.isFile()) {
        if (this._includeFile(e.name)) {
          out.push(full);
        }
      }
    }
    return out;
  }

  static parse(src: string): [EnumName, KeyValueEntry[]][] {
    const list: [EnumName, KeyValueEntry[]][] = [];
    let sublist: KeyValueEntry[] = [];

    // Remove CRLF to simplify
    const text = src.replace(/\r\n/g, '\n');

    // Regex to find `const enum Name { ... }`, optionally prefixed by export/declare
    const enumRe =
      /(?:export\s+)?(?:declare\s+)?const\s+enum\s+([A-Za-z_$][\w$]*)\s*\{([\s\S]*?)\}/g;
    let m;
    while ((m = enumRe.exec(text)) !== null) {
      sublist = [];
      const enumName = m[1];
      let body = m[2];

      // strip comments (single-line and block) while preserving strings
      body = stripComment(body);

      // We'll match members like: KEY = value,  or KEY,
      const memberRe = /([A-Za-z_$][\w$]*)\s*(?:=\s*([^,\n}]+))?,?/g;
      let mm;
      let lastNumeric = null;
      while ((mm = memberRe.exec(body)) !== null) {
        const key = mm[1];
        let valText = mm[2] ? mm[2].trim() : undefined;

        let value;
        if (valText === undefined) {
          // No initializer: follow TS numeric enum rule: start from 0 or previous+1
          if (typeof lastNumeric === 'number') {
            lastNumeric = lastNumeric + 1;
          } else {
            lastNumeric = 0;
          }
          value = String(lastNumeric);
          sublist.push([`${enumName}.${key}`, value]);
          continue;
        }

        // Try to recognize string literal
        const strMatch = valText.match(/^(['`"])([\s\S]*)\1$/);
        if (strMatch) {
          // Use JSON.stringify on the inner content to ensure proper escaping and double quotes
          const inner = strMatch[2];
          value = JSON.stringify(inner);
          lastNumeric = null; // subsequent implicit members don't get numeric increments
          sublist.push([`${enumName}.${key}`, value]);
          continue;
        }

        // Numeric or other expression - normalize simple numbers (dec/hex)
        const numMatch = valText.match(/^[-+]?(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)$/);
        if (numMatch) {
          value = numMatch[1] ? String(numMatch[1]) : String(valText);
          // parse numeric to keep track for increments
          const parsed = Number(value);
          if (Number.isNaN(parsed)) {
            lastNumeric = null;
          } else {
            lastNumeric = parsed;
          }
          sublist.push([`${enumName}.${key}`, value]);
          continue;
        }

        // Fallback: keep the original text as-is (could be reference or expression)
        value = valText;
        lastNumeric = null;
        sublist.push([`${enumName}.${key}`, value]);
      }
      if (sublist.length > 0) {
        sublist.sort((a, b) => b[0].length - a[0].length); // longer keys first for replacement
        list.push([new RegExp(`\\b${enumName}.\\b`), sublist]);
      }
    }
    return list;
  }

  /**
   * Collect mappings from all ts files in the project
   */
  build(): [EnumName, KeyValueEntry[]][] {
    const files = this._options.files.length > 0 ? this._filesInOption() : this._collect(this._cwd);

    const list: [EnumName, KeyValueEntry[]][] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const content = readFileSync(files[i], 'utf8');
        list.push(...ConstEnumHandler.parse(content));
      } catch {}
    }
    return list;
  }
}
