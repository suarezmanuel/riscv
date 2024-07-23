import { Execute } from "./pipeline/execute";
import { Decode } from "./pipeline/decode";
import { InstructionFetch } from "./pipeline/instruction-fetch";
import { MemoryAccess } from "./pipeline/memory-access";
import { Register32 } from "./register32";
import { SystemInterface } from "./system-interface";
import { RAMDevice } from "./system-interface/ram";
import { ROMDevice } from "./system-interface/rom";
import { WriteBack } from "./pipeline/write-back";

enum State {
    InstructionFetch,
    Decode,
    Execute,
    MemoryAccess,
    WriteBack
}

// risc v 32 bit system
class RVI32System {

    state = State.InstructionFetch;

    rom = new ROMDevice();
    ram = new RAMDevice();
    // make an array of length 32 out of registers, define the system regs
    regFile = Array.from ({ length: 32 }, () => new Register32());

    bus = new SystemInterface(this.rom, this.ram);
    
    IF = new InstructionFetch ({
        shouldStall: () => this.state !== State.InstructionFetch,
        bus: this.bus
    });

    DE = new Decode ({
        shouldStall: () => this.state !== State.Decode,
        getInstructionIn: () => this.IF.getInstructionOut(),
        regFile: this.regFile
    });

    EX = new Execute ({
        shouldStall: () => this.state !== State.Execute,
        getDecodedValuesIn: () => this.DE.getDecodedValuesOut()
    });

    MEM = new MemoryAccess ({
        shouldStall: () => this.state !== State.MemoryAccess,
        getExecutionValuesIn: () => this.EX.getExecutionValuesOut(),
        bus: this.bus
    })

    WB = new WriteBack ({
        shouldStall: () => this.state !== State.WriteBack,
        getMemoryAccessValuesIn: () => this.MEM.getMemoryAccessValuesOut(),
        regFile: this.regFile,
    })

    compute () {
        this.IF.compute();
        this.DE.compute();
        this.EX.compute();
        this.MEM.compute();
        this.WB.compute();
    }

    latchNext () {
        this.IF.latchNext();
        this.DE.latchNext();
        this.EX.latchNext();
        this.MEM.latchNext();
        this.WB.latchNext();
        this.regFile.forEach(r => r.latchNext());
    }

    cycle () {

        this.compute();
        this.latchNext();

        switch (this.state) {
            case State.InstructionFetch: { this.state = State.Decode; break; }
            case State.Decode:           { this.state = State.Execute; break; }
            case State.Execute:          { this.state = State.MemoryAccess; break; }
            case State.MemoryAccess:     { this.state = State.WriteBack; break; }
            case State.WriteBack:      { this.state = State.InstructionFetch; debugger; break; }
        }
    }
}

const rv = new RVI32System();

rv.regFile[1].value = 0x20000000;

rv.regFile[2].value = 0xdeadbeef;
rv.regFile[3].value = 0xc0decafe;
rv.regFile[4].value = 0xabad1dea;

const store32 = 0b0000000_00010_00001_010_00100_0100011;
const store16 = 0b0000000_00011_00001_001_00110_0100011;
const store8  = 0b0000000_00100_00001_000_00101_0100011;


while (true) {
    rv.cycle();
}