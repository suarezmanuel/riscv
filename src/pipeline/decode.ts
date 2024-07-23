import { Register32 } from "../register32";
import { boolToInt, signExtend32 } from "../util";
import { PipelineStage } from "./pipeline-stage";

export interface DecodeParams {
    // returns if not active
    shouldStall: () => boolean;
    getInstructionIn: () => number;
    regFile: Array<Register32>; 
}

export class Decode extends PipelineStage {
    
    private instruction = new Register32(0);
    private opcode = new Register32(0);
    private rd = new Register32(0);
    private funct3 = new Register32(0);
    private rs1 = new Register32(0);
    private rs2 = new Register32(0);
    private imm11_0 = new Register32(0);
    private funct7 = new Register32(0);
    private shamt = new Register32(0);

    private isAluOperation = new Register32(0);
    private isStore = new Register32(0);
    private imm32 = new Register32(0);

    private regFile: DecodeParams['regFile'];

    private shouldStall: DecodeParams['shouldStall'];
    private getInstructionIn: DecodeParams['getInstructionIn'];

    constructor (params: DecodeParams) {
        super();
        this.shouldStall = params.shouldStall;
        this.getInstructionIn = params.getInstructionIn;
        this.regFile = params.regFile;
    }

    // will run computes and then latches
    compute () { 

        if (!this.shouldStall()) {
            
            this.instruction.value = this.getInstructionIn();
            // get first 7 bits
            this.opcode.value = this.instruction.nextValue & 0x7f;
            // dest reg
            this.rd.value = (this.instruction.nextValue >> 7) & 0x1f;
            // helps decide operation
            this.funct3.value = (this.instruction.nextValue >> 12) & 0x07;
            // logical right shift
            this.imm11_0.value = (this.instruction.nextValue >>> 20) & 0xfff;
            this.funct7.value = (this.instruction.nextValue >>> 25) & 0x7f;
            const rs1Address = (this.instruction.nextValue >> 15) & 0x1f;
            const rs2Address = (this.instruction.nextValue >> 20) & 0x1f;
            this.shamt.value = rs2Address;

            // should be ok to get value and not nextValue
            this.rs1.value =  rs1Address === 0 ? 0 : this.regFile[rs1Address].value;
            this.rs2.value =  rs2Address === 0 ? 0 : this.regFile[rs2Address].value;

            // remove that bit
            this.isAluOperation.value = boolToInt((this.opcode.nextValue & 0b1011111) === 0b0010011);
            this.isStore.value = boolToInt(this.opcode.nextValue === 0b0100011);

            const storeImm = signExtend32(12, (((this.instruction.nextValue >> 25) & 0x7f) << 5) | ((this.instruction.nextValue >> 7) & 0x1f));
            const aluImm   = signExtend32(12, this.imm11_0.nextValue);

            if (this.isStore.nextValue) {
                this.imm32.value = storeImm;
            } else if (this.isAluOperation.nextValue) {
                this.imm32.value = aluImm;
            } else {
                throw new Error ('Not Impleented');
            }
        }
     }

    latchNext () { 

        this.instruction.latchNext();
        this.opcode     .latchNext();
        this.rd         .latchNext();
        this.funct3     .latchNext();
        this.rs1        .latchNext();
        this.rs2        .latchNext();
        this.imm11_0    .latchNext();
        this.funct7     .latchNext();
        this.shamt      .latchNext();
        this.isAluOperation.latchNext()
        this.isStore    .latchNext();
        this.imm32      .latchNext()
    }

    getDecodedValuesOut() {

        return {
            instruction: this.instruction.value,
            opcode:      this.opcode.value,
            rd:          this.rd.value,
            funct3:      this.funct3.value,
            rs1:         this.rs1.value,
            rs2:         this.rs2.value,
            imm11_0:     this.imm11_0.value,
            funct7:      this.funct7.value,
            shamt:       this.shamt.value,
            isAluOperation: this.isAluOperation.value,
            isStore:     this.isStore.value,
            imm32:       this.imm32.value
        }
    }
}