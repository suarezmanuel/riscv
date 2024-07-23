// base 16 of length 8 padded with zeroes
export const toHexString = (n: number, l = 8) => n.toString(16).padStart(l, '0');
export const toBinString = (n: number, l = 32) => n.toString(2).padStart(l, '0');

// convert twos to unsigned
export const twos = (v: number) => v >>> 0;

// convert unsigned to twos
export const untwos = (v: number) => v >> 0;

export const boolToInt = (x: boolean) => Number(x);

export const signExtend32 = (bits: number, value: number) => ((value << (32-bits)) >> (32-bits)); 