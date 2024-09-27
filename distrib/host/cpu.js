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
// a lot of this code is modified from my org and arch project, the steps to each instruction are the same (except for break and sys call)
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
            this.fetch(); // begins the CPU pipeline
            TSOS.Control.updateCPUTable();
            TSOS.Control.updateMemory();
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
            this.decode1(); // call the first decode
        }
        decode1() {
            switch (this.IR) {
                // load the accumlator with a constant
                case (0xA9):
                    //set the MAR to the memory address to the program counter and read its contents
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    this.PC += 0x0001;
                    this.execute1(); // only one decode needed
                    break;
                //break
                case (0x00):
                    this.execute1();
                    break;
                //Load the accumlator from memory
                case (0xAD):
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
                    this.PC += 0x0001;
                    this.decode2();
                    break;
                //store the accumlator in memory
                case (0x8D):
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
                    this.PC += 0x0001;
                    this.decode2();
                    break;
            }
        }
        decode2() {
            switch (this.IR) {
                //load the accumulator from memory
                case (0xAD):
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    _MemoryAccessor.setHOB(_MemoryAccessor.getMDR());
                    //set the MAR using little endian
                    _MemoryAccessor.setMARFromLittleEndian(_MemoryAccessor.getHOB(), _MemoryAccessor.getLOB());
                    _MemoryAccessor.read();
                    this.PC += 0x0001;
                    this.execute1();
                    break;
                //store the accumulator in memory
                case (0x8D):
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    _MemoryAccessor.setHOB(_MemoryAccessor.getMDR());
                    //set the MAR using little endian
                    _MemoryAccessor.setMARFromLittleEndian(_MemoryAccessor.getHOB(), _MemoryAccessor.getLOB());
                    _MemoryAccessor.read();
                    this.PC += 0x0001;
                    this.execute1();
                    break;
            }
        }
        execute1() {
            switch (this.IR) {
                //load the accumulator with a constant
                case (0xA9):
                    this.Acc = _MemoryAccessor.getMDR();
                    break;
                //break
                case (0x00):
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SOFTWARE_INTERRUPT, _PCBManager.getFirstReadyProcess().PID)); // use this for now, returns the PID of the pcb
                    break;
                //load the accumulator from memory
                case (0xAD):
                    this.Acc = _MemoryAccessor.getMDR();
                    break;
                //store the accumulator in memory
                case (0x8D):
                    _MemoryAccessor.setMDR(this.Acc);
                    _MemoryAccessor.write();
                    break;
            }
        }
        execute2() {
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map