// @ts-check
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execute } from './execute.mjs';

/**
 * @typedef {object} RollupOutput
 * @property {string|undefined} [file]
 */

/**
 * @typedef {object} RollupConfigChunk
 * @property {RollupOutput|RollupOutput[]} [output]
 */

/**
 * @param {any} o
 * @returns {any[]}
 */
const toArr = (o) => (Array.isArray(o) ? o : typeof o === 'object' && o !== null ? [] : [o]);

/**
 * Extract output file paths from rollup config
 * @param {RollupConfigChunk|RollupConfigChunk[]} rollupConfig
 * @returns {string[]}
 */
function getOutputFiles(rollupConfig) {
  const output = /** @type {Array<{file?:string|undefined}>} */ ([]);
  toArr(rollupConfig).forEach((c) => output.push(...toArr(c.output)));
  // filter out entries without file and coerce to string
  return output.map((o) => o.file).filter((f) => typeof f === 'string');
}

/**
 * Print file sizes to the console.
 * @param {string[]} files
 * @returns {void}
 */
function printSize(files) {
  /**
   * @param {number} maxLen
   * @returns {(arg:{file:string,size:number}) => string}
   */
  const mapper =
    (maxLen) =>
    ({ file, size }) =>
      `${file.padEnd(maxLen, ' ')} - ${(size / 1024).toFixed(3)} KB`;
  let maxLen = 0;
  let total = 0;

  /** @type {{file:string,size:number}[]} */
  const info = [];
  files.forEach((file) => {
    try {
      const size = statSync(file).size;
      maxLen = Math.max(maxLen, file.length);
      total += size;
      info.push({ file, size });
    } catch (e) {
      console.warn(`${file}: Not found or no permission to read`, e);
    }
  });

  info.sort((a, b) => a.size - b.size);
  info.push({ file: 'Total', size: total });
  console.log(info.map(mapper(maxLen)).join('\n'));
}

/**
 * Run the build script: rename package if needed, clean dist, run rollup
 * and print sizes.
 */
async function run() {
  await execute(['rimraf', 'dist']);

  const cwd = join(process.cwd(), 'package.json');
  const rawpkg = readFileSync(cwd, 'utf-8');

  /**
   * @type {import('../package.json')}
   */
  const pkg = JSON.parse(rawpkg);

  const { name, version, purpose } = pkg;
  console.log(`Building`, `[${purpose}]`, name, version);

  // ! Must read configs here, or nodejs will not
  // ! be able to find the installed package of this project
  const rollupConfig = (await import('../rollup.config.mjs')).default;

  await execute(['rollup', '-c'], { env: { ...process.env } });

  const files = getOutputFiles(rollupConfig);
  printSize(files);
}

run();
