/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        IR;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        //used to help with decodes for the String FF call
        decodeFlag = 0;
        //used to help with decodes for the String FF call
        executeFlag = 0;
        constructor(PC = 0x00, IR = 0x00, Acc = 0x00, Xreg = 0x00, Yreg = 0x00, Zflag = 0x00, isExecuting = false) {
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0x00;
            this.IR = 0x00;
            this.Acc = 0x00;
            this.Xreg = 0x00;
            this.Yreg = 0x00;
            this.Zflag = 0x00;
            this.isExecuting = false;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.fetch();
            this.decode1();
            this.decode2();
            this.execute1();
            this.execute2();
        }
        fetch() {
            // set MAR to current value of program counter
            _MemoryAccessor.setMAR(this.PC);
            //set the MDR to the value of what was at memory[MAR]
            _MemoryAccessor.read();
            //get the MDR and set it to the Instruction Register
            let mdrValue = _MemoryAccessor.getMDR();
            this.IR = mdrValue;
            // increment the program counter to the next address because the current memory address was read
            this.PC += 0x0001;
        }
        decode1() {
        }
        decode2() {
        }
        execute1() {
        }
        execute2() {
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map