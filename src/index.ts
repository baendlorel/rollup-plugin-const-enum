import { Plugin } from 'rollup';
import { RollupConstEnumOptions } from './types/global.js';

import { normalize } from './options.js';
import { buildConstEnumMap } from './const-enum.js';

const replaceAll =
  typeof String.prototype.replaceAll === 'function'
    ? (s: string, search: any, replace: any) => s.replaceAll(search, replace)
    : (s: string, search: string, replace: string) => {
        return s.split(search).join(replace);
      };

/**
 * ## Usage
 * This is a simple plugin with no ast parsers.
 * It uses regex to detect const enum declarations, and replace them by `String.prototype.replaceAll`(polyfill included).
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
export function constEnum(options?: Partial<RollupConstEnumOptions>) {
  const { include, constEnumInclude } = normalize(options);
  const map = buildConstEnumMap(constEnumInclude);
  const replacers = Array.from(map.entries());
  replacers.sort((a, b) => b[0].length - a[0].length); // longer first to avoid partial matches

  const plugin: Plugin = {
    name: '__NAME__',
    transform(code, id) {
      if (!include(id)) {
        return null;
      }
      if (replacers.length === 0) {
        return null;
      }

      let outCode = code;
      for (let i = 0; i < replacers.length; i++) {
        outCode = replaceAll(outCode, replacers[i][0], replacers[i][1]);
      }

      return outCode;
    },
  };

  return plugin;
}
