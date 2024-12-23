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
                // requires only one decode
                case (0xA9): // load the accumlator with a constant
                case (0xA0): //load the y register with a constant
                case (0xA2): // load the x register with a constant
                    _MemoryAccessor.setMAR(this.PC); //set the MAR to the memory address to the program counter and read its contents
                    _MemoryAccessor.read();
                    this.PC += 0x0001;
                    this.execute1(); // only one decode needed, jump straight to
                    break;
                // requires a second decode
                case (0xAD): //Load the accumlator from memory
                case (0x8D): //store the accumlator in memory
                case (0xAC): // load the y register from memory
                case (0xAE): // load the x register from memory
                case (0xEC): // compare a byte in mem to x reg, if equal set z flag to 1
                case (0xEE): // increment a byte in memory
                case (0x6D): // add content of an address to the accumulator and update the accumulator
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
                    this.PC += 0x0001;
                    this.decode2();
                    break;
                // special cases that do not have opperands
                case (0xEA): // No OP 
                case (0x00): //break
                    this.execute1();
                    break;
                //SYS calls 
                case (0xFF):
                    if (this.Xreg === 0x01 || this.Xreg === 0x02) {
                        this.execute1();
                        break;
                    }
                //branch n bytes if Z flag = 0
                case (0xD0):
                    if (this.Zflag == 0) { // if the z flag is not set, decode the next byte and branch
                        _MemoryAccessor.setMAR(this.PC);
                        _MemoryAccessor.read();
                        this.addRelativeOffsetToPC(_MemoryAccessor.getMDR()); // called to correctly alter the PC when branching
                        this.PC += 0x0001; //this is needed so the fetch does not grab the wrong value
                        break;
                    }
                    else { // if the z flag is set, skip the next memory address and continue the program
                        this.PC += 0x0001; // only jump one because the program is going to end and then fetch will deal with the program counter properly
                        break;
                    }
                // if none of the above op codes were used, then it is an invalid opcode and must end
                default:
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(INVALID_OP_CODE, _PCBManager.getFirstReadyProcess().PID)); // terminate the process and deal with invalid op 
                    break;
            }
        }
        decode2() {
            switch (this.IR) {
                case (0xAD): //load the accumulator from memory
                case (0x8D): //store the accumulator in memory
                case (0xAC): // load the y register from memory
                case (0xAE): // load the x register from memory
                case (0xEC): // compare a byte in mem to x reg, if equal set z flag to 1 
                case (0xEE): // increment a byte in memory
                case (0x6D): // add content of an address to the accumulator and update the accumulator
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
                //load the accumulator from memory
                case (0xAD):
                    this.Acc = _MemoryAccessor.getMDR();
                    break;
                //store the accumulator in memory
                case (0x8D):
                    _MemoryAccessor.setMDR(this.Acc);
                    _MemoryAccessor.write();
                    break;
                //load the x reg with a constant
                case (0xA2):
                    this.Xreg = _MemoryAccessor.getMDR();
                    break;
                //load the y reg with a constant
                case (0xA0):
                    this.Yreg = _MemoryAccessor.getMDR();
                    break;
                //load the y reg from memory
                case (0xAC):
                    this.Yreg = _MemoryAccessor.getMDR();
                    break;
                //load the x reg from memory
                case (0xAE):
                    this.Xreg = _MemoryAccessor.getMDR();
                    break;
                //no op
                case (0xEA):
                    break;
                //break
                case (0x00):
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SOFTWARE_INTERRUPT, _PCBManager.getFirstReadyProcess().PID)); // use this for now, returns the PID of the pcb
                    break;
                //compare byte in mem to x reg, if equal set z flag to 1.
                case (0xEC):
                    this.Acc = _MemoryAccessor.getMDR(); // get the byte in memory and set to x reg KEEP AN EYE ON THIS - changed as of 10/1 to accumulator, may need more testing
                    this.execute2(); // then call this to compare it to the x register
                    break;
                //increment a byte in memory
                case (0xEE):
                    this.Acc = _MemoryAccessor.getMDR(); // get the value from memory
                    this.execute2();
                    break;
                // add content of an address to the accumulator and update the accumulator
                case (0x6D):
                    this.Acc += _MemoryAccessor.getMDR(); // add the MDR to the value in the accumulator already
                    break;
                //SYS Calls
                case (0xFF):
                    if (this.Xreg == 0x01) { //SYS call 1 - if there is a 0x01 at the x register, print the integer in the y register
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_PRINT_INT, [this.Yreg])); // construct the y register as an array so it can be printed by being passed as an interrupt
                        break;
                    }
                    else if (this.Xreg == 0x02) { //SYS call 2 - print the 00 terminated string stored at the address in the Y register
                        let address = this.Yreg;
                        let charAsByte;
                        //Chat GPT 10/1/24 I asked for help on how to access the memory value stored at the y register and construct a string until the null terminator
                        // Loop through memory until we hit a null terminator (0x00)
                        do {
                            _MemoryAccessor.setMAR(address); // Set MAR to the current address in Yreg
                            _MemoryAccessor.read(); // Read from memory
                            charAsByte = _MemoryAccessor.getMDR(); // Get the byte at memory[MAR]
                            if (charAsByte !== 0x00) {
                                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SYSTEM_CALL_PRINT_STRING, [charAsByte]));
                            }
                            address++; // Move to the next byte in memory
                        } while (charAsByte !== 0x00); // Stop when we hit the null terminator
                    }
                    break;
            }
        }
        execute2() {
            switch (this.IR) {
                //compare byte in mem to x reg, if equal set z flag to 1.
                case (0xEC):
                    if (this.Acc === this.Xreg) {
                        this.Zflag = 1;
                    }
                    else {
                        this.Zflag = 0;
                    }
                    break;
                //increment a byte in memory
                case (0xEE):
                    this.Acc++; // add one to the value gotten from memory
                    this.writeBack();
                    break;
            }
        }
        // special step for writing back to memory. used for just the EE instruction
        writeBack() {
            switch (this.IR) {
                //increment a byte in memory
                case (0xEE):
                    _MemoryAccessor.setMDR(this.Acc);
                    _MemoryAccessor.write(); // replace the original value in memory with the new incremented value
                    break;
            }
        }
        //properly add the relative offset to program counter
        addRelativeOffsetToPC(relativeOffset) {
            if (relativeOffset <= 0x7F) { // 127 in decimal - each value can be added to PC as is
                this.PC += relativeOffset;
                // wrap around if greater than 0xFF
                if (this.PC > 0xFF) {
                    this.PC -= 0x100; // wrap around to start from 0
                }
            }
            else { // values must be adjusted before they can be subtracted
                relativeOffset = 0x100 - relativeOffset; // get the proper value if you need to decrement the branch
                this.PC -= relativeOffset;
                // wrap around if less than 0x00
                if (this.PC < 0x00) {
                    this.PC += 0x100; // wrap around to end at 0xFF
                }
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map