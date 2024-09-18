var TSOS;
(function (TSOS) {
    class MemoryManager {
        memoryAvailability;
        segmentToUse;
        constructor() {
            this.memoryAvailability = []; // this will need to be larger once I can hold more memory
        }
        init() {
            this.memoryAvailability.push(true); // adds a true value to the array. this means there is space available
        }
        isSpaceAvailable() {
            for (let i = 0; i < this.memoryAvailability.length; i++) {
                if (this.memoryAvailability[i] = true) {
                    this.setSegment(i); // sets the segment to the first available spot
                    return true;
                }
            }
            return false; // nothing was availble
        }
        setSegment(index) {
            this.segmentToUse = index;
            this.memoryAvailability[index] = false; // segment now off limits
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map