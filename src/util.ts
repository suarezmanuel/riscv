// base 16 of length 8 padded with zeroes
export const toHexString = (n: number, l = 8) => n.toString(16).padStart(l, '0');
export const toBinString = (n: number, l = 32) => n.toString(2).padStart(l, '0');

// if we put a positive negative number
// it will be converted to a negative number
const twosTemp = new Uint32Array(1);

export const twos = (v: number) => {
    twosTemp[0] = v;
    return twosTemp[0];
};

export const untwos = (v: number) => {
    if (v >= 0x80000000) {
        return ~~v;
    } else {
        return v;
    }
};

