export const enum Color {
  Red,
  Green,
  Blue,
}
const enum Flags {
  A = 0x01,
  B = 0x02,
  C = 0x04,
}
export const enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}
declare const enum Mixed {
  A = 1,
  B = 'string',
  C = 0x10,
  D,
}
export const enum First {
  A = 1,
  B = 2,
}

export const enum Second {
  X = 'x',
  Y = 'y',
}

export const enum Numbers {
  A = 10,
  B,
  C,
  D = 20,
  E,
  F,
}
