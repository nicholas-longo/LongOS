module TSOS {

    export class MemoryManager {
        private memoryAvailability: boolean[]
        private segmentToUse: number; 
        
        constructor() {
            this.memoryAvailability = [] // this will need to be larger once I can hold more memory
            this.init();
        }
        
        public init(): void {
            this.memoryAvailability.push(true); // adds a true value to the array. this means there is space available
        }


        public isSpaceAvailable(): boolean {
            for (let i = 0; i < this.memoryAvailability.length; i ++) {
                if(this.memoryAvailability[i] === true) {
                    this.allocateSegment(i); // sets the segment to the first available spot
                    return true
                } 
                    return false; // nothing was availble
            }
        }

        public allocateSegment(index: number): void {
            this.segmentToUse = index;
            this.memoryAvailability[index] = false // segment now off limits
        }

        public deallocateSegement(index: number) : void {
            this.memoryAvailability[index] = true; // the memory at that segment is available again
        }

    }
}