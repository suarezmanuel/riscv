import { SystemInterface } from "./system-interface";
import { RAMDevice } from "./system-interface/ram";
import { ROMDevice } from "./system-interface/rom";
import { toHexString } from "./util";

// risc v 32 bit system
class RVI32System {

    rom = new ROMDevice();
    ram = new RAMDevice();

    bus = new SystemInterface(this.rom, this.ram);
}

const rv = new RVI32System();
rv.bus.write(0x20400000, 0x01020304);

console.log(toHexString(rv.bus.read(0x20000000)));