module TSOS {

    export class MemoryManager {
        private memoryAvailability: boolean[]
        private segmentToUse: number; 
        
        constructor() {
            this.memoryAvailability = [] // this will need to be larger once I can hold more memory
        }
        
        public init(): void {
            this.memoryAvailability.push(true); // adds a true value to the array. this means there is space available
        }


        public isSpaceAvailable(): boolean {
            for (let i = 0; i < this.memoryAvailability.length; i ++) {
                if(this.memoryAvailability[i] = true) {
                    this.setSegment(i); // sets the segment to the first available spot
                    return true
                }
            }
            return false; // nothing was availble
        }

        public setSegment(index: number): void {
            this.segmentToUse = index;
            this.memoryAvailability[index] = false // segment now off limits
        }

        // TODO, once the program is done, it needs to call a function here that will set the memoryAvailability back to true


    }
}