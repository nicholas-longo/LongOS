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

        public rollIn() {

        }

        public rollOut() {

        }





    }
}