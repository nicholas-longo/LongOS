/**
 * Most of this content comes from my Org and Arch Project
 */

module TSOS {
    export class MemoryAccessor {
        private memory: Memory; 
        private HOB: number;
        private LOB: number;
        constructor(memory: Memory) {
            this.memory = memory
        }

        public getHOB(): number {
            return this.HOB;
        }
    
        public setHOB(value: number): void {
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
            _Memory.setMDR(value);
        }

         // calls read() from memory
        public read(): void {
            _Memory.read();
        }

        //calls write() from memory
        public write(): void {
            _Memory.write();
        }

        // when called, it will add the entered address and value into the MAR and MDR
        // respectively, then it will write it to memory 
        public writeImmediate(address: number, value: number): void {
            this.setMAR(address);
            this.setMDR(value);
            this.write();
        }

        // for now just overwrite any exisitng program at 0
        public flashMemory(program: Array<number>) {
            _Memory.reset() // this is temporary because we only need to load one program at a time
            const startingAddress: number = 0x000;
            for (let i = 0; i < program.length; i ++) {
                this.writeImmediate(startingAddress + i, program[i]) // address increments by 1 each time and is passed as the MAR, correct code is passed as the MDR
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
    }
}