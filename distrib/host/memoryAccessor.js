/**
 * Most of this content comes from my Org and Arch Project
 */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        HOB;
        LOB;
        constructor(memory) {
            this.memory = memory;
        }
        getHOB() {
            return this.HOB;
        }
        setHOB(value) {
            this.HOB = value;
        }
        getLOB() {
            return this.LOB;
        }
        setLOB(value) {
            this.LOB = value;
        }
        //calls the getMemory() the memory from memory
        getMemory() {
            return _Memory.getMemory();
        }
        // calls the setMAR() from memory
        setMAR(address) {
            _Memory.setMAR(address);
        }
        // calls the getMAR() from memory
        getMAR() {
            return _Memory.getMAR();
        }
        // calls the getMAR() from memory
        getMDR() {
            return _Memory.getMDR();
        }
        // calls the setMDR from memory
        setMDR(value) {
            _Memory.setMDR(value);
        }
        // calls read() from memory
        read() {
            _Memory.read();
        }
        //calls write() from memory
        write() {
            _Memory.write();
        }
        // when called, it will add the entered address and value into the MAR and MDR
        // respectively, then it will write it to memory 
        writeImmediate(address, value) {
            this.setMAR(address);
            this.setMDR(value);
            this.write();
        }
        // for now just overwrite any exisitng program at 0
        flashMemory(program, segment) {
            const base = segment * 0x100;
            const startingAddress = base;
            for (let i = 0; i < program.length; i++) {
                this.writeImmediate(startingAddress + i, program[i]); // address increments by 1 each time and is passed as the MAR, correct code is passed as the MDR
            }
            TSOS.Control.updateMemory();
        }
        // uses bitwise operations to properly format the high and low order bytes
        setMARFromLittleEndian(HOB, LOB) {
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
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map