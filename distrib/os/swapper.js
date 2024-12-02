var TSOS;
(function (TSOS) {
    class Swapper {
        // returns true if a swap file was successfully created, false if not
        isSwapSpaceAvailable() {
            if (!_DiskFormatted) { // disk not formatted
                console.log("no disk");
                return false;
            }
            if (_krnDiskSystemDeviceDriver.getNumberOfAvailableDataBlocks() < NUMBER_OF_BLOCKS_FOR_SWAP_FILE) { // not enough data blocks
                console.log("not enough data block");
                return false;
            }
            if (_krnDiskSystemDeviceDriver.getFirstAvailableDirectoryBlock() === "") { // no directory blocks available
                console.log("no directory");
                return false;
            }
            return true;
        }
        createSwapFile() {
        }
        rollIn() {
        }
        rollOut() {
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map