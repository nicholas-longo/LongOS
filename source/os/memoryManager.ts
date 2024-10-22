module TSOS {

    export class MemoryManager {
        private memoryAvailability: boolean[];
        
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
                    _CurrentMemorySegment = i;  
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

        // deallocates all segments and also wipes the memory array
        public clearMemory(): void {
            for (let i = 0; i < this.memoryAvailability.length; i ++) {
                this.memoryAvailability[i] = true;
            }

            _Memory.reset(); // clear memory
            Control.updateMemory(); // update memory table
            _PCBManager.terminateAllPCBs(); // deal with the pcb table
        }

    }
}