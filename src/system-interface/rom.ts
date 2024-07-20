import { MMIODevice } from "../system-interface";

// 1 MB
export const ROMSize = 1024 * 1024;

export class ROMDevice implements MMIODevice {

    // ROMSize/4 32 bit ints will be ROMSize bytes
    // we only have 32 bit operations
    private rom = new Uint32Array(ROMSize/4);

    read (address: number) {
        // create a mask to not go out of bounds
        return this.rom[address & (ROMSize/4 - 1)];
    }

    write (address: number, value: number) {
        // do nothing
    }

    load (data: Uint32Array) {
        for (let i = 0; i < (ROMSize/4); i++) {
            // if go over data's length, we pad it
            if (i >= data.length) {
                this.rom[i] = 0xffffffff;
            } else {
                this.rom[i] = data[i];
            }
        }
    }
}