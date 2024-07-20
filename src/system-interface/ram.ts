import { MMIODevice } from "../system-interface";

// 4 MB
export const RAMSize = 1024 * 1024 * 4;

export class RAMDevice implements MMIODevice {

    // RAMSize/4 32 bit ints will be RAMSize bytes
    // we only have 32 bit operations
    private ram = new Uint32Array(RAMSize/4);

    read (address: number) {
        // create a mask to not go out of bounds
        return this.ram[address & (RAMSize/4 - 1)];
    }

    write (address: number, value: number) {
        this.ram[address & (RAMSize/4 - 1)] = value;
    }
}