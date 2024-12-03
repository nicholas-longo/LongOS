/**
 * Most of this content comes from my Org and Arch Project
 */

module TSOS {
    export class MemoryAccessor {
        private memory: Memory; 
        private HOB: number;
        private LOB: number;
        private segmemt: number; 
        private base: number; 
        private limit: number; 


        constructor(memory: Memory) {
            this.memory = memory
        }

        public getHOB(): number {
            return this.HOB;
        }
    
        public setHOB(value: number): void {
            // if the high order byte is not 0, then it cannot fit in the current segment so there is an out of bounds exception
            if(value !== 0x00) {
                _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_OUT_OF_BOUNDS_EXCEPTION, _PCBManager.getFirstReadyProcess().PID)); // terminate the process and deal with memory out of bounds
            }
            this.HOB = value;
        }
    
        public getLOB(): number {
            return this.LOB;
        }
    
        public setLOB(value: number): void {
            this.LOB = value;
        }

        //calls the getMemory() the memory from memory
        public getMemory(): number[] {
            return _Memory.getMemory();
        }


        // calls the setMAR() from memory
        public setMAR(address: number): void {
            _Memory.setMAR(address);
        }

        // calls the getMAR() from memory
        public getMAR(): number {
            return _Memory.getMAR();
        }

        // calls the getMAR() from memory
        public getMDR(): number {
            return _Memory.getMDR();
        }

        // calls the setMDR from memory
        public setMDR(value: number): void {
            // if the program tries to increment a byte over two bytes than an out of bounds exception needs to be thrown
            if(value >= 0x100) {
                _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_OUT_OF_BOUNDS_EXCEPTION, _PCBManager.getFirstReadyProcess().PID));
            }
            _Memory.setMDR(value);
        }

         // calls read() from memory
        public read(): void {
            const baseAdjustment = _PCBManager.getFirstReadyProcess().base
            _Memory.read(baseAdjustment);
        }

        //calls write() from memory
        public write(): void {
            let baseAdjustment = 0; 
            if (_PCBManager.pcbReadyQueue.length > 0 && !ROLLING_IN_FLAG) {
                baseAdjustment = _PCBManager.getFirstReadyProcess().base
             }

            if(ROLLING_IN_FLAG) {
                baseAdjustment = BASE_FOR_WRITING_ON_SWAP;
            }

            _Memory.write(baseAdjustment); 

        }

        // when called, it will add the entered address and value into the MAR and MDR
        // respectively, then it will write it to memory 
        public writeImmediate(address: number, value: number): void {
            this.setMAR(address);
            this.setMDR(value);
            this.write();
        }

        // for now just overwrite any exisitng program at 0
        public flashMemory(program: Array<number>, segment: number) {
            const base = segment * 0x100; 
            const startingAddress: number = base;

            for (let i = 0; i < program.length; i ++) {
                this.writeImmediate(startingAddress + i, program[i]) // address increments by 1 each time and is passed as the MAR, correct code is passed as the MDR
            }

            // fill the rest of the memory segment with 0's when the program is loaded in
            for (let i = program.length; i < 0x100; i ++) {
                this.writeImmediate(base + i, 0);
            }

            Control.updateMemory(); 
        }

        // uses bitwise operations to properly format the high and low order bytes
        public setMARFromLittleEndian(HOB: number, LOB: number): void {
            //HOB << 8 shifts the high order bit 8 bits to the left. 
            // if HOB was 0xAA, it would become 0xAA00 after HOB << 8
            // now with the value 0xAA00, you can use a bitwise or which is this symbol: |
            // this will compare two hex numbers and 
            // make the new number have the value of the bit from the bit that was not 0
            // for example, 0xAA00 | 0xBB = 0xAABB
            const address = (HOB << 8) | LOB;
            this.setMAR(address);
        }

        // return a specific chunk of memory
        public dumpMemory(base: number, limit:number):number[] {
            const originalMAR = this.getMAR(); 
            let memoryDump: number[] = [];

            for (let address = base + 1; address < limit; address ++) {
                this.setMAR(address); // set the MAR 
                this.read(); // read to set the MDR
                const value = this.getMDR(); 
                memoryDump.push(value) // add the value of the MDR into an array
            }

            this.setMAR(originalMAR); // set it back to the original value after retrieving the memory

            return memoryDump; 
        }
    }
}



