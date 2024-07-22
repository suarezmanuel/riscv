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
        getExecutionValuesIn: () => this.EX.getExecutionValuesOut()
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
            case State.WriteBack:      { this.state = State.InstructionFetch; break; }
        }
    }
}

const rv = new RVI32System();

// imm[11:0] rs1   000 rd 0010011  ADDI
// 0000000 rs2 rs1 000 rd 0110011  ADD
// 0100000 rs2 rs1 000 rd 0110011  SUB

rv.regFile[1].value = 0x01020304;
rv.regFile[2].value = 0x02030405;

rv.rom.load(new Uint32Array ([
    0b111111111111_00001_000_00011_0010011,  // ADDI 1, r1, r3
]));

while (true) {
    rv.cycle();
}