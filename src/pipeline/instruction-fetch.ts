import { Register32 } from "../register32";
import { MemoryMap, SystemInterface } from "../system-interface";
import { PipelineStage } from "./pipeline-stage";

export interface InstructionFetchParams {
    bus: SystemInterface;
    // returns if not active
    shouldStall: () => boolean;
}

export class InstructionFetch extends PipelineStage {

    private pc = new Register32(MemoryMap.ProgramROMStart);
    private pcNext = new Register32(MemoryMap.ProgramROMStart);

    private instruction = new Register32(0);
    private instructionNext = new Register32(0);

    private bus: InstructionFetchParams['bus'];
    private shouldStall: InstructionFetchParams['shouldStall'];

    constructor (params: InstructionFetchParams) {
        super();
        this.bus = params.bus;
        this.shouldStall = params.shouldStall;
    }

    // will run computes and then latches
    compute () { 

        if (!this.shouldStall()) {
            this.instruction.value = this.bus.read(this.pc.value);
            // we are on 32 bit
            this.pcNext.value += 4;
        }
     }

    latchNext () { 

        this.instruction.value = this.instructionNext.value;
        this.pc.value = this.pcNext.value;
    }

    getInstructionOut () { return this.instruction.value; } 
}