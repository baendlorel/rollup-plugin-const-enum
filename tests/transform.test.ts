import { ConstEnumHandler } from '@/const-enum.js';
import { describe, expect, it } from 'vitest';
import { sampleEnums } from './helpers.js';

describe('ConstEnumHandler.parseConstEnums', () => {
  it('simple', () => {
    const list = ConstEnumHandler.parse(sampleEnums.simple);
    expect(list).toEqual([
      [
        new RegExp('\\bColors.\\b'),
        [
          // # sorted by key length descending
          ['Colors.Green', '1'],
          ['Colors.Blue', '2'],
          ['Colors.Red', '0'],
        ],
      ],
    ]);
  });

  it('stringEnum', () => {
    const list = ConstEnumHandler.parse(sampleEnums.stringEnum);
    expect(list).toEqual([
      [
        new RegExp('\\bStatus.\\b'),
        [
          ['Status.Inactive', '"inactive"'],
          ['Status.Pending', '"pending"'],
          ['Status.Active', '"active"'],
        ],
      ],
    ]);
  });

  it('mixed', () => {
    const list = ConstEnumHandler.parse(sampleEnums.mixed);
    expect(list).toEqual([
      [
        new RegExp('\\bMixed.\\b'),
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
    const list = ConstEnumHandler.parse(sampleEnums.multiple);
    expect(list).toEqual([
      [
        new RegExp('\\bFirst.\\b'),
        [
          ['First.A', '1'],
          ['First.B', '2'],
        ],
      ],
      [
        new RegExp('\\bSecond.\\b'),
        [
          ['Second.X', '"x"'],
          ['Second.Y', '"y"'],
        ],
      ],
    ]);
  });

  it('withComments', () => {
    const list = ConstEnumHandler.parse(sampleEnums.withComments);
    expect(list).toEqual([
      [
        new RegExp('\\bStatus.\\b'),
        [
          ['Status.Inactive', '0'],
          ['Status.Active', '1'],
        ],
      ],
    ]);
  });

  it('error', () => {
    const list = ConstEnumHandler.parse(sampleEnums.error);
    expect(list).toEqual([
      [
        new RegExp('\\bStatus.\\b'),
        [
          ['Status.a', '"23"'],
          ['Status.b', '0'], // ! Enum member must have initializer, here it just goes on
        ],
      ],
    ]);
  });

  it('final', () => {
    const list = ConstEnumHandler.parse(sampleEnums.final);
    expect(list).toEqual([
      [
        new RegExp('\\bStatus.\\b'),
        [
          ['Status.Inactive', '"23"'],
          ['Status.Active', '0'],
          ['Status.BAKDB', '1'],
          ['Status.KDJF', '2'],
        ],
      ],
    ]);
  });
});
