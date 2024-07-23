import { MemoryAccessWidth } from "./pipeline/memory-access";
import { RAMDevice } from "./system-interface/ram";
import { ROMDevice } from "./system-interface/rom";
import { toHexString, toBinString } from "./util"

export interface MMIODevice {
    
    read (address: number, width: MemoryAccessWidth): number;
    write (address: number, value: number, width: MemoryAccessWidth): void;
}

export enum MemoryMap {
    ProgramROMStart = 0x10000000,
    ProgramROMEnd   = 0x1fffffff,
    RAMStart        = 0x20000000,
    RAMEnd          = 0x2fffffff,
}

export class SystemInterface implements MMIODevice {
    
    // code in rom
    private rom: ROMDevice;
    // vars in ram
    private ram: RAMDevice;
    
    constructor (rom: ROMDevice, ram: RAMDevice) {
        this.rom = rom;
        this.ram = ram;
    }

    read (address: number, width: MemoryAccessWidth) {

        // if ((address & 0b11) != 0) {
        //     throw new Error (`Unaligned read from addr 0x${toHexString(address)}`);
        // }

        // if inside ProgramROMStart
        if ((address & MemoryMap.ProgramROMStart) === MemoryMap.ProgramROMStart) {
            // by dividing by 4 we are aligning the read
            // does wrap around
            return this.rom.read(address & 0x0fffffff, width);
        }

        if ((address & MemoryMap.RAMStart) === MemoryMap.RAMStart) {
            // does wrap around
            return this.ram.read(address & 0x0fffffff, width);
        }

        return 0;
    }

    write (address: number, value: number, width: MemoryAccessWidth) {

        if ((address & 0b11) != 0) {
            throw new Error (`Unaligned read from addr 0x${toHexString(address)} (value=0x${toHexString(value)})`);
        }

        if ((address & MemoryMap.RAMStart) === MemoryMap.RAMStart) {
            // does wrap around
            return this.ram.write(address & 0x0fffffff, value, width);
        }

        return 0;
    }
}