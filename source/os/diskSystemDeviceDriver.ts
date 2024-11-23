   module TSOS {

    // Extends DeviceDriver
    export class DiskSystemDeviceDriver extends DeviceDriver {
        constructor() {
            super(); 
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry(): void {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        // put all of the data into session storage 
        public formatDisk(): void {
            for (let t = 0; t < NUM_TRACKS; t ++) {
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        // set a key and a value to be stored
                        // the key will be the string of the track, sector, and block groupng such as "tsb". The value will have the first 4 digits reserved for the in use bit, and the link to the next entry
                        // 120 0's must be printed because every 2 hex digits is one byte
                        sessionStorage.setItem(`${t}${s}${b}`, '0---' + '0'.repeat((BLOCK_SIZE - 4) *2)) // 11/20/24 thank you Josh Seligman for some inspiration on how to store the data in the sessionStorage
                    }
                }
            }
            
            this.updateDiskTable();  
            _DiskFormatted = true; 
        }

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted
        // 2 file name existed
        // 3 no available directory block
        // 4 no available data block
        public createFile(fileName: String): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) !== "") { // if a TSB already exists return an error
                return 2; 
            }

            const availableDirectoryTSB: String = this.getFirstAvailableDirectoryBlock(); 
            const availableDataTSB: String = this.getFirstAvailableDataBlock(); 

            if(availableDirectoryTSB === "") {
                return 3;
            }

            if(availableDataTSB === "") {
                return 4; 
            }






            return 0;
        }

        public updateDiskTable(): void {
            let diskTable = document.getElementById("diskTable") as HTMLTableElement; 
            diskTable.innerHTML = ""; // make the format table message go away
            
            if(!_DiskFormatted) { // put the headers in if this is the first time being formatted
                // the top columns will need to be created, and each row needs to be populated according to the session storage
                // chatGPT 11/20/24 I asked it to help me delete the old table and put a new one in with the proper headings when format is called for the first time
                const headerRow = diskTable.insertRow();
                const headers = ["TSB", "In Use", "Next TSB", "Data"];
                headers.forEach(header => {
                    const cell = headerRow.insertCell();
                    cell.textContent = header;
                    cell.style.fontWeight = "bold";
                });

            }   // disk formatted and headers in place, so just update the table according to the session storage
                // populate the tables based on the data in the session storage (at this point it should all be 0's)
                for (let t = 0; t < NUM_TRACKS; t ++) {
                    for (let s = 0; s < NUM_SECTORS; s ++){
                        for (let b = 0; b < NUM_BLOCKS; b ++) {
                            const key = `${t}${s}${b}`;
                            const value = sessionStorage.getItem(key) // this should always just be '0---' + '0'.repeat((BLOCK_SIZE - 4) * 2);

                            // obtain the in use character, and next characters
                            const inUse = value.substring(0,1); // just the first character
                            const next = value.substring(1,4); // the next three characters
                            const data = value.substring(4); // everything left over is data

                            //populate each row
                            const row = diskTable.insertRow(); 
                            row.insertCell().textContent = key; 
                            row.insertCell().textContent = inUse; 
                            row.insertCell().textContent = next; 
                            row.insertCell().textContent = data; 
                        }
                    }
                }
        }

        public getFirstAvailableDirectoryBlock(): String {
            // loop through the session storage for directories (only ones that start with 0), check the first bit. if there is a 0 available return its TSB string. if loop ends, return "";
            let value = "";
            for (let s = 0; s < NUM_SECTORS; s ++) {
                for (let b = 1; b < NUM_BLOCKS; b ++) {
                    // TSB 000 is reserved for the MBR so make the block start at 1 
                    value = sessionStorage.getItem(`0${s}${b}`)
                    if (value.substring(0,1) === "0") { // if the first character is a 0, that means it is not in use and its value should be returned
                        console.log(`0${s}${b}`)
                        return `0${s}${b}` // return the TSB of the first available block
                    }
                }
            }
            return ""; // return empty if there is no available directory block
        }

        public getFirstAvailableDataBlock(): String {
            // loop through the session storage for data (only ones that start with 1 and on), check the first bit. if there is a 0 available return its TSB string. if loop ends, return "";
            let value = ""; 
            for (let t = 1; t < NUM_TRACKS; t ++) { // start t on track one because track 0 is for directories
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        value = sessionStorage.getItem(`${t}${s}${b}`); 
                        if(value.substring(0,1) === "0") {
                            console.log(`${t}${s}${b}`)
                            return `${t}${s}${b}` // return the TSB of the first available block
                        }
                    }
                }
            }
             
            return ""; // return empty if there is no available
        }

        public getTSBFromFileName(fileName: String): String {
            // convert the filename to hex. loop through each of the directories and get the substring(4). if a match, return the key from the session storage where that value matched
            return "";
        }

    
        
    }
}
