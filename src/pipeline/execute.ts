import { Register32 } from "../register32";
import { twos, untwos } from "../util";
import { Decode } from "./decode";
import { PipelineStage } from "./pipeline-stage";

export interface ExecuteParams {
    shouldStall: () => boolean;
    getDecodedValuesIn: () => ReturnType<Decode['getDecodedValuesOut']>;
    // returns if not active
}

export enum ALUOperation {
    ADD  = 0b000,
    // SUB = 0b000,
    SLL  = 0b001,
    // SLA  = 0b001,
    SLT  = 0b010,
    SLTU = 0b011,
    XOR  = 0b100,
    SR  = 0b101,
    // SRA = 0b101,
    OR   = 0b110,
    AND  = 0b111
}

export class Execute extends PipelineStage {
    
    private shouldStall: ExecuteParams['shouldStall'];
    private getDecodedValuesIn: ExecuteParams['getDecodedValuesIn'];

    private aluResult = new Register32(0);

    private rd = 0;
    private rdNext = 0;

    private isAluOperation = false;
    private isAluOperationNext = false;

    constructor (params: ExecuteParams) {
        super();
        this.shouldStall = params.shouldStall;
        this.getDecodedValuesIn = params.getDecodedValuesIn;
    }

    // will run compute and then latch
    compute () { 

        if (!this.shouldStall()) {

            const decoded = this.getDecodedValuesIn();
           
            this.rdNext = decoded.rd;

            // check if fifth bit is on
            const isRegisterOp = Boolean((decoded.opcode >> 5) & 1);
            const isAlternate  = Boolean((decoded.imm11_0 >> 10) & 1);

            // ?
            const imm32 = twos((decoded.imm11_0 << 20) >> 20);
            // remove that bit
            this.isAluOperationNext = (decoded.opcode & 0b1011111) === 0b0010011;

            switch (decoded.funct3) {

                case ALUOperation.ADD: {
                    if (isRegisterOp) {

                        this.aluResult.value = isAlternate
                            ? decoded.rs1 - decoded.rs2
                            : decoded.rs1 + decoded.rs2
                    } else {
                        
                        this.aluResult.value = decoded.rs1 + imm32;
                    }
                    break;
                }

                case ALUOperation.SLL: {
                    // arithemtic left shift doesnt exist
                    // handle overflow
                    this.aluResult.value = isRegisterOp
                        ? decoded.rs1 << decoded.rs2
                        : decoded.rs1 << decoded.shamt
                    break;
                }

                case ALUOperation.SLT: {
                    this.aluResult.value = isRegisterOp
                        ? Number(untwos(decoded.rs1) < untwos(decoded.rs2))
                        : Number(untwos(decoded.rs1) < untwos(imm32));
                    break;
                }

                case ALUOperation.SLTU: {
                    this.aluResult.value = isRegisterOp
                        ? Number(decoded.rs1 < decoded.rs2)
                        : Number(decoded.rs1 < imm32);
                    break;
                }

                case ALUOperation.XOR: {
                    this.aluResult.value = isRegisterOp
                        ? decoded.rs1 ^ decoded.rs2
                        : decoded.rs1 ^ imm32;
                    break;
                }

                case ALUOperation.SR: {
                    // arithe,mtic left shift doesnt exist
                    // handle overflow
                    this.aluResult.value = isRegisterOp
                        ? isAlternate
                            ? decoded.rs1 >> decoded.rs2
                            : decoded.rs1 >>> decoded.rs2
                        : isAlternate
                            ? decoded.rs1 >> decoded.shamt
                            : decoded.rs1 >>> decoded.shamt
                    break;
                }

                case ALUOperation.OR: {
                    this.aluResult.value = isRegisterOp
                        ? decoded.rs1 | decoded.rs2
                        : decoded.rs1 | imm32;
                    break;
                }

                case ALUOperation.AND: {
                    this.aluResult.value = isRegisterOp
                        ? decoded.rs1 & decoded.rs2
                        : decoded.rs1 & imm32;
                    break;
                }
            }
        }
    }

    latchNext () { 
        this.aluResult.latchNext();
        this.rd = this.rdNext;
        this.isAluOperation = this.isAluOperationNext;
    }

    getExecutionValuesOut () {
        return {
            aluResult: this.aluResult.value,
            rd: this.rd,
            isAluOperation: this.isAluOperation
        };
    }
}