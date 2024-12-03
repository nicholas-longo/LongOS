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
            // delete the previous swap file 
            // update the location, seg, base, and limit accordingly
            // update the pcb table
        }
        rollOut(PID) {
            //deallocate the memory segment where the tail is (one that most recently ran)
            // create a swap file for its memory contents
            // update the location, seg, base, and limit accordingly
            // update the pcb table
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map