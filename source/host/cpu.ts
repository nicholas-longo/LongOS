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

module TSOS {

    export class Cpu {

         //used to help with decodes for the String FF call
        private decodeFlag: number = 0; 

        //used to help with decodes for the String FF call
        private executeFlag: number = 0; 


        constructor(public PC: number = 0x00,
                    public IR: number = 0x00,
                    public Acc: number = 0x00,
                    public Xreg: number = 0x00,
                    public Yreg: number = 0x00,
                    public Zflag: number = 0x00,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0x00;
            this.IR = 0x00;
            this.Acc = 0x00;
            this.Xreg = 0x00;
            this.Yreg = 0x00;
            this.Zflag = 0x00;
            this.isExecuting = false; 
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            
            this.fetch(); // begins the CPU pipeline
            
            Control.updateCPUTable(); 
            Control.updateMemory(); 
        }


        public fetch(): void {
            // set MAR to current value of program counter
            _MemoryAccessor.setMAR(this.PC);

            //set the MDR to the value of what was at memory[MAR]
            _MemoryAccessor.read();

             //get the MDR and set it to the Instruction Register
            let mdrValue = _MemoryAccessor.getMDR()
            this.IR = mdrValue;

            // increment the program counter to the next address because the current memory address was read
            this.PC += 0x0001;
            this.decode1(); // call the first decode

        }

        public decode1(): void {
            switch (this.IR) {
                // requires only one decode
                case (0xA9): // load the accumlator with a constant
                case (0xA0): //load the y register with a constant
                case (0xA2): // load the x register with a constant
                    _MemoryAccessor.setMAR(this.PC); //set the MAR to the memory address to the program counter and read its contents
                    _MemoryAccessor.read();
                    this.PC += 0x0001
                    this.execute1(); // only one decode needed, jump straight to
                    break;
                
                

                // requires a second decode
                case (0xAD): //Load the accumlator from memory
                case (0x8D): //store the accumlator in memory
                case (0xAC): // load the y register from memory
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read(); 
                    _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
                    this.PC += 0x0001
                    this.decode2(); 
                    break;

                // special cases with varying logic
                case (0x00):  //break
                    this.execute1();
                    break;
            }
        }

        public decode2(): void {
            switch(this.IR) {
                case(0xAD): //load the accumulator from memory
                case(0x8D): //store the accumulator in memory
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

        public execute1(): void {
            switch (this.IR) {
                //load the accumulator with a constant
                case (0xA9):
                    this.Acc = _MemoryAccessor.getMDR();
                    break;
                //break
                case(0x00):
                    _KernelInterruptQueue.enqueue(new Interrupt(SOFTWARE_INTERRUPT, _PCBManager.getFirstReadyProcess().PID)); // use this for now, returns the PID of the pcb
                    console.log(_Memory.getMemory());
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
                    
            }
        }

        public execute2(): void {
            
        }

        // remember the program counter. start by accessing the memory. remember that control needs to update the cpu gui



    }
}


// going to need to check and make sure that the HOB is not greater than 0, if it is find a way to break the program and not let it execute
// DO that for project 3