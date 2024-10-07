var TSOS;
(function (TSOS) {
    class MemoryManager {
        memoryAvailability;
        constructor() {
            this.memoryAvailability = []; // this will need to be larger once I can hold more memory
            this.init();
        }
        init() {
            this.memoryAvailability.push(true); // adds a true value to the array. this means there is space available
        }
        isSpaceAvailable() {
            for (let i = 0; i < this.memoryAvailability.length; i++) {
                if (this.memoryAvailability[i] === true) {
                    this.allocateSegment(i); // sets the segment to the first available spot
                    return true;
                }
                return false; // nothing was availble
            }
        }
        allocateSegment(index) {
            this.memoryAvailability[index] = false; // segment now off limits
        }
        deallocateSegement(segment) {
            this.memoryAvailability[segment] = true; // the memory at that segment is available again
            const pcb = _PCBManager.findPCBBySegment(segment); // based on the passed in segment, update the PCB table
            if (pcb) {
                _PCBManager.updatePCBAfterDeallocated(segment); // clean up the PCB table
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map