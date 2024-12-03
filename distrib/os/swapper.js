var TSOS;
(function (TSOS) {
    class Swapper {
        // returns true if a swap file was successfully created, false if not
        isSwapSpaceAvailable() {
            if (!_DiskFormatted) { // disk not formatted
                return false;
            }
            if (_krnDiskSystemDeviceDriver.getNumberOfAvailableDataBlocks() < NUMBER_OF_BLOCKS_FOR_SWAP_FILE) { // not enough data blocks
                return false;
            }
            if (_krnDiskSystemDeviceDriver.getFirstAvailableDirectoryBlock() === "") { // no directory blocks available
                return false;
            }
            return true;
        }
        createSwapFile(PID, program) {
            _krnDiskSystemDeviceDriver.createSwapFile(PID, program);
        }
        // IR was reading undefined for processes in disk, look into that
        rollIn(PID) {
            // allocate the open memory segment to the process
            _MemoryManager.isSpaceAvailable();
            const segment = _CurrentMemorySegment; // get the segment that is open
            const swapFileName = `$${PID}`;
            _krnDiskSystemDeviceDriver.readFile(swapFileName, true); // get the hex from the previous swap file
            const programString = READ_DATA;
            //chat gpt 12/2/24 helped me turn my string into an array of hex numbers
            const program = programString
                .match(/.{1,2}/g) // Split into chunks of 2 characters
                ?.map((hex) => parseInt(hex, 16)) || []; // Convert each pair to a number
            // delete the previous swap file 
            _krnDiskSystemDeviceDriver.deleteFile(`$${PID}`);
            // update the location, seg, base, and limit accordingly
            const pcb = _PCBManager.findPCB(PID);
            pcb.updatePCBLocation("Memory");
            pcb.updateSegmentBaseAndLimit(segment);
            // load the program into memory
            _MemoryAccessor.flashMemory(program, segment);
            // update the pcb table
            pcb.updatePCBTable();
        }
        rollOut(PID) {
            //deallocate the memory segment where the tail is (one that most recently ran)
            const pcb = _PCBManager.findPCB(PID);
            const pcbSegment = pcb.segment;
            _MemoryManager.deallocateSegement(pcbSegment);
            // create a swap file for its memory contents
            this.createSwapFile(PID, "A9038D4100A9018D4000AC4000A201FFEE4000AE4000EC4100D0EFA9448D4200A94F8D4300A94E8D4400A9458D4500A9008D4600A202A042FF00"); // AA is temp until i can get the right program
            // update the location, seg, base, and limit accordingly
            pcb.updatePCBForSwapFile();
            // update the pcb table
            pcb.updatePCBTable();
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map