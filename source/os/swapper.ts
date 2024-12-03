module TSOS {

    export class Swapper {
        
        // returns true if a swap file was successfully created, false if not
        public isSwapSpaceAvailable():boolean {
            if(!_DiskFormatted) { // disk not formatted
                return false;
            }
            
            if(_krnDiskSystemDeviceDriver.getNumberOfAvailableDataBlocks() < NUMBER_OF_BLOCKS_FOR_SWAP_FILE) { // not enough data blocks
                return false; 
            } 

            if(_krnDiskSystemDeviceDriver.getFirstAvailableDirectoryBlock() === "") { // no directory blocks available
                return false; 
            }
            
            return true; 
        }

        public createSwapFile(PID: number, program: string): void {
            _krnDiskSystemDeviceDriver.createSwapFile(PID, program);
        }

        // IR was reading undefined for processes in disk, look into that

        public rollIn(PID:number): void {
            // allocate the open memory segment to the process
            // delete the previous swap file 
            // update the location, seg, base, and limit accordingly
            // update the pcb table

        }

        public rollOut(PID:number):void {
            //deallocate the memory segment where the tail is (one that most recently ran)
            const pcb = _PCBManager.findPCB(PID);
            const pcbSegment = pcb.segment; 

            _MemoryManager.deallocateSegement(pcbSegment);
            console.log(_MemoryManager.memoryAvailability);

            // create a swap file for its memory contents
            this.createSwapFile(PID, "AA") // AA is temp until i can get the right program

            // update the location, seg, base, and limit accordingly
            pcb.updatePCBForSwapFile(); 

            // update the pcb table
            pcb.updatePCBTable(); 
        }





    }
}