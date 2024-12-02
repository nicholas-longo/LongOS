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
        rollIn() {
        }
        rollOut() {
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map