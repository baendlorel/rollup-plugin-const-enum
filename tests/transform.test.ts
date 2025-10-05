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
    expect(list).toEqual([
      [
        new RegExp('\bStatus\.\b'),
        [
          ['Status.Active', '"active"'],
          ['Status.Inactive', '"inactive"'],
          ['Status.Pending', '"pending"'],
        ],
      ],
    ]);
  });

  it('mixed', () => {
    const list = ConstEnumHandler.parseConstEnums(sampleEnums.mixed);
    expect(list).toEqual([
      [
        new RegExp('\bMixed\.\b'),
        [
          ['Mixed.A', '1'],
          ['Mixed.B', '"string"'],
          ['Mixed.C', '0x10'],
          ['Mixed.D', '17'],
        ],
      ],
    ]);
  });

  it('multiple', () => {
    const list = ConstEnumHandler.parseConstEnums(sampleEnums.multiple);
    expect(list).toEqual([
      [
        new RegExp('\bFirst\.\b'),
        [
          ['First.A', '1'],
          ['First.B', '2'],
        ],
      ],
      [
        new RegExp('\bSecond\.\b'),
        [
          ['Second.X', '"x"'],
          ['Second.Y', '"y"'],
        ],
      ],
    ]);
  });

  it('withComments', () => {
    const list = ConstEnumHandler.parseConstEnums(sampleEnums.withComments);
    expect(list).toEqual([
      [
        new RegExp('\bStatus\.\b'),
        [
          ['Status.Active', '1'],
          ['Status.Inactive', '0'],
        ],
      ],
    ]);
  });
});
