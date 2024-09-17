/**
 * Most of this content comes from my Org and Arch Project
 */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        constructor(memory) {
            this.memory = memory;
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
        flashMemory(program) {
            _Memory.reset(); // this is temporary because we only need to load one program at a time
            console.log(_Memory.getMemory()); // testing purposes
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map