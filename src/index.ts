import { Plugin } from 'rollup';
import { ConstEnumReplacementList, RollupConstEnumOptions } from './types/global.js';

import { normalize } from './options.js';
import { ConstEnumHandler } from './const-enum.js';

/**
 * ## Usage
 * This is a simple plugin with no ast parsers.
 * Uses regex to detect const enum declarations and replace them.
 *
 * ```ts
 * export default {
 *   ...,
 *   plugins:[
 *     constEnum(), // place it near the front
 *     ...,
 *   ]
 * }
 * ```
 *
 * __PKG_INFO__
 */
export default function constEnum(options?: Partial<RollupConstEnumOptions>) {
  const opts = normalize(options);
  const list = new ConstEnumHandler(opts).build();
  const regList: RegexGroup[] = list.map((entry) => [entry[0], ...toRegexReplacer(entry[1])]);

  const plugin: Plugin & ConstEnumReplacementList = {
    name: '__NAME__',
    __kskb_replacement_list: list,
    transform(code, _id) {
      if (list.length === 0) {
        return null;
      }

      const prelist = regList.filter((entry) => entry[0].test(code));
      if (prelist.length === 0) {
        return null;
      }

      let output = code;
      for (let i = 0; i < prelist.length; i++) {
        output = output.replace(prelist[i][1], prelist[i][2]);
      }

      return { code: output, map: null };
    },
  };

  return plugin;
}

/**
 *
 * @param entries Here entries is already sorted and `.` is escaped in `Parser.parse`
 */
function toRegexReplacer(entries: KeyValueEntry[]): [RegExp, Replacer] {
  const map: Record<string, string> = Object.create(null);
  const escapedKeys: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    map[e[0]] = e[1];
    escapedKeys.push(e[0].replace('.', '\\.'));
  }
  const regex = new RegExp('\\b(' + escapedKeys.join('|') + ')\\b', 'g');
  const replacer = (match: string) => map[match] ?? match;
  return [regex, replacer];
}
