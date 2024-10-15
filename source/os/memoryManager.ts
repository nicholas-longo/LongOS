module TSOS {

    export class MemoryManager {
        private memoryAvailability: boolean[];
        private mostRecentAssignedSegement: number;
        
        constructor() {
            this.memoryAvailability = [] // this will need to be larger once I can hold more memory
            this.init();
        }
        
        public init(): void {
            this.memoryAvailability.push(true); 
            this.memoryAvailability.push(true); 
            this.memoryAvailability.push(true); // add three segments that can hold memory
        }


        public isSpaceAvailable(): boolean {
            for (let i = 0; i < this.memoryAvailability.length; i ++) {
                if(this.memoryAvailability[i] === true) {
                    this.allocateSegment(i); // sets the segment to the first available spot
                    this.mostRecentAssignedSegement = i; 
                    return true
                } 
            }
            return false; // nothing was availble
        }

        public allocateSegment(index: number): void {
            this.memoryAvailability[index] = false // segment now off limits
        }

        public deallocateSegement(segment: number) : void {
            this.memoryAvailability[segment] = true; // the memory at that segment is available again
            const pcb = _PCBManager.findPCBBySegment(segment); // based on the passed in segment, update the PCB table
            if (pcb) {
                _PCBManager.updatePCBAfterDeallocated(segment); // clean up the PCB table
            }
        }

        public getMostRecentAssignedSegment(): number {
            return this.mostRecentAssignedSegement; 
        }

    }
}