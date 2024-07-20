import { RAMDevice } from "./system-interface/ram";
import { ROMDevice } from "./system-interface/rom";
import { toHexString, toBinString } from "./util"

export interface MMIODevice {
    
    read (address: number): number;
    write (address: number, value: number): void;
}

export enum MemoryMap {
    ProgramROMStart = 0x10000000,
    ProgramROMEnd   = 0x1fffffff,
    RAMStart        = 0x20000000,
    RAMEnd          = 0x2fffffff,
}

export class SystemInterface implements MMIODevice {
    
    private rom: ROMDevice;
    private ram: RAMDevice;
    
    constructor (rom: ROMDevice, ram: RAMDevice) {
        this.rom = rom;
        this.ram = ram;
    }

    read (address: number) {

        if ((address & 0b11) != 0) {
            throw new Error (`Unaligned read from addr 0x${toHexString(address)}`);
        }

        // if inside ProgramROMStart
        if ((address & MemoryMap.ProgramROMStart) === MemoryMap.ProgramROMStart) {
            // by dividing by 4 we are aligning the read
            // does wrap around
            return this.rom.read((address & 0x0fffffff) >> 2);
        }

        if ((address & MemoryMap.RAMStart) === MemoryMap.RAMStart) {
            // does wrap around
            return this.ram.read((address & 0x0fffffff) >> 2);
        }

        return 0;
    }

    write (address: number, value: number) {

        if ((address & 0b11) != 0) {
            throw new Error (`Unaligned read from addr 0x${toHexString(address)} (value=0x${toHexString(value)})`);
        }

        if ((address & MemoryMap.RAMStart) === MemoryMap.RAMStart) {
            // does wrap around
            return this.ram.write((address & 0x0fffffff) >> 2, value);
        }

        return 0;
    }
}