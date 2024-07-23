import { MemoryAccessWidth } from "../pipeline/memory-access";
import { MMIODevice } from "../system-interface";

// 1 MB
export const ROMSize = 1024 * 1024;

export class ROMDevice implements MMIODevice {

    // ROMSize/4 32 bit ints will be ROMSize bytes
    // we only have 32 bit operations
    private rom = new Uint32Array(ROMSize/4);

    read (address: number, width: MemoryAccessWidth) {

        const addr = address >>> 2;
        const offset = address & 0b11;
        const value = this.rom[addr & (ROMSize/4 - 1)];

        switch (width) {

            case MemoryAccessWidth.Byte: {
                switch (offset) {
                    case 0b00: return (value & 0xff000000) >>> 24;
                    case 0b01: return (value & 0x00ff0000) >>> 16;
                    case 0b10: return (value & 0x0000ff00) >>> 8;
                    case 0b11: return (value & 0xff);
                }
            }

            case MemoryAccessWidth.HalfWorld: {
                switch (offset & 1) {
                    case 0b00: return (value & 0xffff0000) >>> 16;
                    case 0b01: return (value & 0xffff);
                }
            }

            case MemoryAccessWidth.Word: return value;
        }
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