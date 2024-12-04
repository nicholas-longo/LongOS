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
            ROLLING_IN_FLAG = true; // this flag is needed so memory can adjust what base it uses

            // allocate the open memory segment to the process
            _MemoryManager.isSpaceAvailable();
            const segment = _CurrentMemorySegment; // get the segment that is open

            const swapFileName = `$${PID}`;
            _krnDiskSystemDeviceDriver.readFile(swapFileName, true); // get the hex from the previous swap file
            const programString = READ_DATA;

            //chat gpt 12/2/24 helped me turn my string into an array of hex numbers
            const program: number[] = programString
            .match(/.{1,2}/g) // Split into chunks of 2 characters
            ?.map((hex) => parseInt(hex, 16)) || []; // Convert each pair to a number

            // delete the previous swap file 
            _krnDiskSystemDeviceDriver.deleteFile(`$${PID}`);
            
            // update the location, seg, base, and limit accordingly
            const pcb =_PCBManager.findPCB(PID);
            pcb.updatePCBLocation("Memory");
            pcb.updateSegmentBaseAndLimit(segment);

            
            // load the program into memory
            _MemoryAccessor.flashMemory(program, segment);

            // update the pcb table
            pcb.updatePCBTable();

            Control.updateMemory(); 

            ROLLING_IN_FLAG = false; // set to off when not rolling in

        }

        public rollOut(PID:number):void {
            //deallocate the memory segment where the tail is (one that most recently ran)
            const pcb = _PCBManager.findPCB(PID);
            const pcbSegment = pcb.segment; 
            BASE_FOR_WRITING_ON_SWAP = pcb.base;

            
            //get the program stored with the PID 
            const program: number[] = _MemoryAccessor.dumpMemory(pcb.base, pcb.limit);

            // convert the array of hex digits to string
            const programString: string = program
                .map((value) => value.toString(16).toUpperCase().padStart(2, '0')) // Convert to hex and ensure 2 digits
                .join(''); // Join all values into a single string
           
            _MemoryManager.deallocateSegement(pcbSegment);

            // create a swap file for its memory contents
            this.createSwapFile(PID, programString);

            // update the location, seg, base, and limit accordingly
            pcb.updatePCBForSwapFile(); 

            // update the pcb table
            pcb.updatePCBTable(); 
        }





    }
}