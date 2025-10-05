import fs from 'node:fs';
import path from 'node:path';
import { RollupConstEnumOptions } from './types/global.js';

export class ConstEnumHandler {
  private readonly cwd = process.cwd();
  private readonly excludedDirs: string[];
  constructor(private readonly options: RollupConstEnumOptions) {
    this.excludedDirs = this.options.excludedDirectories.map((d) => path.join(this.cwd, d));
  }

  private includeFile(s: string) {
    if (this.options.skipDts && s.endsWith('.d.ts')) {
      return false;
    }
    return this.options.suffixes.some((suffix) => s.endsWith(suffix));
  }

  private filesInOption() {
    const files = this.options.files.map((f) => path.join(this.cwd, f));
    return files.filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  }

  private collect(dir: string): string[] {
    const out: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (this.excludedDirs.includes(full)) {
          continue;
        }
        out.push(...this.collect(full));
      } else if (e.isFile()) {
        if (this.includeFile(e.name)) {
          out.push(full);
        }
      }
    }
    return out;
  }

  // todo 保存成enum的名字-> 这个enum的map 的map
  /**
   * @returns `[enumName,[key,value][]]`
   */
  static parseConstEnums(src: string): [EnumName, KeyValueEntry[]][] {
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

      // strip block comments
      body = body.replace(/\/\*[\s\S]*?\*\//g, '');

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
        list.push([new RegExp(`\b${enumName}\.\b`), sublist]);
      }
    }
    return list;
  }

  /**
   * Collect mappings from all ts files in the project
   */
  buildConstEnumList(): [EnumName, KeyValueEntry[]][] {
    const files = this.options.files.length > 0 ? this.filesInOption() : this.collect(this.cwd);

    const list: [EnumName, KeyValueEntry[]][] = [];
    for (let i = 0; i < files.length; i++) {
      let content = null;
      try {
        content = fs.readFileSync(files[i], 'utf8');
      } catch {
        continue;
      }
      list.push(...ConstEnumHandler.parseConstEnums(content));
    }
    return list;
  }
}
