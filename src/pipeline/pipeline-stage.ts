export abstract class PipelineStage {

    abstract compute (): void;
    abstract latchNext(): void;
}

// on clock save we save calculation into register
// on clock load we load register into text pipe stage
// class InstructionFetch extends PipelineStage {
    
//     private a: number;
//     private aNext: number;

//     compute() {
//         this.aNext = 10;
//     }

//     latchNext() {
//         this.a = this.aNext;
//     }

//     // this will be public, such that only on clock load
//     // which is latchNext, others can get this value
//     getA() { return this.a; }
// }