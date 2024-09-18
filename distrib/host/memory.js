/**
 * Some of this content was taken from my Org and Arch Project
 */
var TSOS;
(function (TSOS) {
    class Memory {
        memory;
        MAR; // memory address register
        MDR; // memory data register
        constructor() {
            //initializes the memory array
            this.memory = [];
            this.MAR = 0;
            this.MDR = 0;
            this.init();
        }
        // prob will change the number of bytes the memory array is
        // initialize a blank memory array. the size will first be 256 bytes so it can store one program
        init() {
            for (let i = 0x00; i < 0x100; i += 0x01) {
                this.memory[i] = 0x00;
            }
        }
        getMemory() {
            return this.memory;
        }
        getMAR() {
            return this.MAR;
        }
        setMAR(value) {
            this.MAR = value;
        }
        getMDR() {
            return this.MDR;
        }
        setMDR(value) {
            this.MDR = value;
        }
        // reads the memory location in the MAR and updates the MDR
        read() {
            this.MDR = this.memory[this.MAR];
        }
        // write the contents of the MDR to memory at the location indicated by the MAR
        write() {
            this.memory[this.MAR] = this.MDR;
        }
        //MAR, MDR, and memory array are all overwritten with 0's
        reset() {
            this.MAR = 0;
            this.MDR = 0;
            //makes the entire array 0's
            this.memory.fill(0x00);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map