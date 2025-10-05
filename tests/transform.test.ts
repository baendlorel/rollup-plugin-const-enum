import { ConstEnumHandler } from '@/const-enum.js';
import { describe, expect, it } from 'vitest';
import { sampleEnums } from './helpers.js';

describe('ConstEnumHandler.parseConstEnums', () => {
  it('simple', () => {
    const list = ConstEnumHandler.parseConstEnums(sampleEnums.simple);
    expect(list).toEqual([
      [
        new RegExp('\bColors\.\b'),
        [
          ['Colors.Red', '0'],
          ['Colors.Green', '1'],
          ['Colors.Blue', '2'],
        ],
      ],
    ]);
  });

  it('stringEnum', () => {
    const list = ConstEnumHandler.parseConstEnums(sampleEnums.stringEnum);
  });
});
