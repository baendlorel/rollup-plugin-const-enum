import { Plugin } from 'rollup';
import { RollupConstEnumOptions } from './types/global.js';

import { normalize } from './options.js';
import { ConstEnumHandler } from './const-enum.js';

/**
 * ## Usage
 * This is a simple plugin with no ast parsers.
 * Uses regex to detect const enum declarations, replace them by `String.prototype.replaceAll`(polyfill included).
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

  const plugin: Plugin = {
    name: '__NAME__',
    transform(code, _id) {
      if (list.length === 0) {
        return null;
      }

      const prelist = list.filter((entry) => entry[0].test(code));
      if (prelist.length === 0) {
        return null;
      }

      let output = code;
      for (let i = 0; i < prelist.length; i++) {
        const sublist = prelist[i][1];
        for (let j = 0; j < sublist.length; j++) {
          output = output.replaceAll(sublist[j][0], sublist[j][1]);
        }
      }

      return { code: output, map: null };
    },
  };

  return plugin;
}
