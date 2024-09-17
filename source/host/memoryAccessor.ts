/**
 * Most of this content comes from my Org and Arch Project
 */

module TSOS {
    export class MemoryAccessor {
        private memory: Memory; 
        constructor(memory: Memory) {
            this.memory = memory
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
            Control.updateMemory(); // add this in later
        }
    }
}