/**
 * Some of this content was taken from my Org and Arch Project 
 */

module TSOS {

    export class Memory {
        private memory: number[]; 
        private MAR: number; // memory address register
        private MDR: number; // memory data register

         constructor() {;
        //initializes the memory array
        this.memory = [];
        this.MAR = 0;
        this.MDR = 0;
        this.init();
    }
        
    // prob will change the number of bytes the memory array is
    // initialize a blank memory array. the size will first be 256 bytes so it can store one program
        public init(): void {
            for (let i: number = 0x00; i < 0x100; i += 0x01) {
                this.memory[i] = 0x00; 
            }
        }

        public getMemory(): number[] {
            return this.memory;
        }

        public getMAR(): number {
            return this.MAR;
        }
    
        public setMAR(value: number): void {
            this.MAR = value;
        }

        public getMDR(): number {
            return this.MDR;
        }
    
        public setMDR(value: number): void {
            this.MDR = value;
        }
    
        // reads the memory location in the MAR and updates the MDR
        public read(): void {
            this.MDR = this.memory[this.MAR];
        }
    
        // write the contents of the MDR to memory at the location indicated by the MAR
        public write(): void {
            this.memory[this.MAR] = this.MDR;
        }

        //MAR, MDR, and memory array are all overwritten with 0's
        public reset(): void {
            this.MAR = 0;
            this.MDR = 0; 
            //makes the entire array 0's
            this.memory.fill(0x00);
        }
    }
}