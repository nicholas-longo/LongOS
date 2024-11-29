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
        public createFile(fileName: string): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) !== "") { // if a TSB already exists return an error
                return 2; 
            }

            const availableDirectoryTSB: string = this.getFirstAvailableDirectoryBlock(); 
            const availableDataTSB: string = this.getFirstAvailableDataBlock(); 

            if(availableDirectoryTSB === "") {
                return 3;
            }

            if(availableDataTSB === "") {
                return 4; 
            }

            // TODO add the date and time the file was created 

            // convert the file name to hex 
            const fileNameAsHex = Utils.charactersToHexString(fileName);
            
            // get the data that is going to need to be added, its length, and how many 0's to add to the end
            const headerAndNameOfDirectoryString = `1${availableDataTSB}${fileNameAsHex}`; // 1 for in use, availableDataTSB is the next link, fileNameAsHex is the file name written out in hex
            const lengthOfHeader = headerAndNameOfDirectoryString.length - 4; // -4 is to not include the in use bit and next TSB
            const zeroesNeeded = MAX_DATA_SIZE * 2 - lengthOfHeader; 

            // set the session storage with the new data
            const directoryString = headerAndNameOfDirectoryString + '0'.repeat(zeroesNeeded); 
            sessionStorage.setItem(availableDirectoryTSB, directoryString); 

            // wipe out data in the data block, and set the in use bit to 1
            sessionStorage.setItem(availableDataTSB, '1---' + '0'.repeat((BLOCK_SIZE - 4) *2))

            // update the display
            this.updateDiskTable(); 
            
            // no errors
            return 0; 
        }

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted
        // 2 file name not found
        // 3 not enough data blocks to fit the contents
        public writeFile(fileName: string, contents: string) {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) === "") { // if TSB does not exist, return an error
                return 2; 
            }

            const contentsAsHexString = Utils.charactersToHexString(contents); // contents formatted as hex
            const contentLength = contentsAsHexString.length; // length of the hex string
            const numberOfAvailableDataBlocks = this.getNumberOfAvailableDataBlocks(); // number of available data blocks
            
            if(contentLength / MAX_DATA_SIZE > numberOfAvailableDataBlocks) {
                return 3; 
            }

            // if it gets here it means the file is already created and there is enough data for the contents 

            // get the tsb from the file name
            let currentDirectoryTSB = this.getTSBFromFileName(fileName);
            let currentDataTSB = sessionStorage.getItem(currentDirectoryTSB).substring(1,4);

            // make all of the original data blocks not be in use
            while (currentDataTSB !== "---") {
                const currentData = sessionStorage.getItem(currentDataTSB);
                if (!currentData) {
                    break; 
                }

                sessionStorage.setItem(currentDataTSB, `0${currentData.substring(1)}`); // set the in use bit to 0 and clear the links
                currentDataTSB = currentData.substring(1, 4); // set the currentTSB to the next link  
                
            }

            // fill the appropriate amount of data blocks with the data that write is trying to use
            let dataBlockTSB = this.getFirstAvailableDataBlock(); 
            let content = contentsAsHexString;
            while (true) {
                if (content.length <= MAX_DATA_SIZE * 2) {
                    const zeroesNeeded = MAX_DATA_SIZE * 2 - content.length; 
                    sessionStorage.setItem(dataBlockTSB, `1---${content + '0'.repeat(zeroesNeeded)}`) // no links needed, fill leftover space with 0
                    break; // this means all of content has been written
                } else {
                    // fit the MAX_DATA_SIZE amount of charaters to the dataBlockTSB, 
                    let chunkOfContents = content.substring(0, MAX_DATA_SIZE*2);
                    let nextDataBlockTSB = this.getFirstAvailableDataBlock();
                    sessionStorage.setItem(dataBlockTSB, `1${nextDataBlockTSB}${chunkOfContents}`)
                    
                    // trim content to account for part of its data being gone
                    content = content.substring(MAX_DATA_SIZE*2);
                    // set to the available data block
                    dataBlockTSB = nextDataBlockTSB;
                }
                
            }

            this.updateDiskTable();
            return 0; 

        }


        public readFile(fileName: string): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) === "") { // if TSB does not exist, return an error
                return 2; 
            }
            
            const tsb = this.getTSBFromFileName(fileName);
            const data = this.getAllDataAsOneString(tsb);
            //console.log(data);
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

        public getFirstAvailableDirectoryBlock(): string {
            // loop through the session storage for directories (only ones that start with 0), check the first bit. if there is a 0 available return its TSB string. if loop ends, return "";
            let value = "";
            for (let s = 0; s < NUM_SECTORS; s ++) {
                for (let b = 1; b < NUM_BLOCKS; b ++) {
                    // TSB 000 is reserved for the MBR so make the block start at 1 
                    value = sessionStorage.getItem(`0${s}${b}`)
                    if (value.substring(0,1) === "0") { // if the first character is a 0, that means it is not in use and its value should be returned
                        return `0${s}${b}` // return the TSB of the first available block
                    }
                }
            }
            return ""; // return empty if there is no available directory block
        }

        public getFirstAvailableDataBlock(): string {
            // loop through the session storage for data (only ones that start with 1 and on), check the first bit. if there is a 0 available return its TSB string. if loop ends, return "";
            let value = ""; 
            for (let t = 1; t < NUM_TRACKS; t ++) { // start t on track one because track 0 is for directories
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        value = sessionStorage.getItem(`${t}${s}${b}`); 
                        if(value.substring(0,1) === "0") {
                            return `${t}${s}${b}` // return the TSB of the first available block
                        }
                    }
                }
            }
             
            return ""; // return empty if there is no available
        }

        public getTSBFromFileName(fileName: string): string {
            const fileNameAsHex = Utils.charactersToHexString(fileName); 
            let end = fileNameAsHex.length; // the first 0 in the string (where the fileName ends)
            let value = ""; // used to keep track of the data at a particular block
            let valueTrimmed = "" // cutting off the 0's of the string if needed

            for (let t = 0; t < 1; t ++) {
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        value = sessionStorage.getItem(`${t}${s}${b}`); 
                        valueTrimmed = value.substring(4); // no header
                        valueTrimmed = valueTrimmed.substring(0, end); // trim the end if the file name is not max length
                        
                        if (fileNameAsHex === valueTrimmed) {
                            return `${t}${s}${b}` // the file name matched an existing tsb
                        }
                    }
                }
            }
            return ""; // no match
        }

        public getNumberOfAvailableDataBlocks(): number {
            // loop through all data blocks and count each that has the in use bit as 0 (the first bit)
            let count = 0; 
            let value = ""; 
            for (let t = 1; t < NUM_TRACKS; t ++) { // do not count the directory
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        value = sessionStorage.getItem(`${t}${s}${b}`);
                        if (value.charAt(0) === "0") {
                            count ++; 
                        }
                    }
                }
            }
            return count;
        }

        public getAllDataAsOneString(tsb:string): string {
            let hexString = "";
            let dataTSB = sessionStorage.getItem(tsb).substring(1, 4); // get the first tsb of the data block from the directory block
            // make all of the original data blocks not be in use
            while (dataTSB !== "---") {
                const currentData = sessionStorage.getItem(dataTSB);
                if (!currentData) {
                    break; 
                }
                console.log("ran")
                hexString += currentData.substring(4); // set the in use bit to 0 and clear the links
                dataTSB = currentData.substring(1, 4); // set the currentTSB to the next link  
                
            }
            //const zeroIndex = hexString.indexOf('0'); 
            //console.log(hexString.substring(0, zeroIndex))
            console.log(hexString);
            return hexString; // trim off the end of the data with 0's

        }

    
        
    }
}
