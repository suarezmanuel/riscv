import { Register32 } from "../register32";
import { twos } from "../util";
import { DecodedValues } from "./instruction-decode";
import { PipelineStage } from "./pipeline-stage";

export interface ExecuteParams {
    shouldStall: () => boolean;
    getDecodedValuesIn: () => DecodedValues;
    // returns if not active
}

export enum ALUOperation {
    ADD  = 0b000,
    // SUB = 0b000,
    SLL  = 0b001,
    SLT  = 0b010,
    // SLTU = 0b011,
    XOR  = 0b100,
    SRL  = 0b101,
    // SRA = 0b101,
    OR   = 0b110,
    AND  = 0b111
}

export class Execute extends PipelineStage {
    
    private shouldStall: ExecuteParams['shouldStall'];
    private getDecodedValuesIn: ExecuteParams['getDecodedValuesIn'];

    private aluResult     = new Register32(0);
    private aluResultNext = new Register32(0);

    constructor (params: ExecuteParams) {
        super();
        this.shouldStall = params.shouldStall;
        this.getDecodedValuesIn = params.getDecodedValuesIn;
    }

    // will run computes and then latches
    compute () { 

        if (!this.shouldStall()) {

            const decoded = this.getDecodedValuesIn();
           
            // check if fifth bit is on
            const isRegisterOp = Boolean((decoded.opcode >> 5) & 1);
            const isALternate  = Boolean((decoded.imm11_0 >> 10) & 1);

            // ?
            const imm32 = twos((decoded.imm11_0 << 20) >> 20)

            switch (decoded.funct3) {
                case ALUOperation.ADD: {
                    if (isRegisterOp) {

                        this.aluResultNext.value = isALternate
                        ? decoded.rs1 - decoded.rs2
                        : decoded.rs1 + decoded.rs2

                    } else {
                        
                        this.aluResultNext.value = decoded.rs1 + imm32;
                    }
                    break;
                }

                case ALUOperation.SLL: break;
                case ALUOperation.SLT: break;
                case ALUOperation.XOR: break;
                case ALUOperation.SRL: break;
                case ALUOperation.OR: break;
                case ALUOperation.AND: break;
            }
        }
    }

    latchNext () { 
        this.aluResult.value = this.aluResultNext.value;
    }

    getAluResultOut () {
        return this.aluResult.value;
    }
}