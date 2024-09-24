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
            this.fetch();
            this.decode1();
            this.decode2();
            this.execute1();
            this.execute2();
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

        }

        public decode1(): void {
            
        }

        public decode2(): void {
            
        }

        public execute1(): void {
            
        }

        public execute2(): void {
            
        }

        // remember the program counter. start by accessing the memory. remember that control needs to update the cpu gui



    }
}
