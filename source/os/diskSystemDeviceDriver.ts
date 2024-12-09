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
        public writeFile(fileName: string, contents: string, inHex: boolean = false) {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) === "") { // if TSB does not exist, return an error
                return 2; 
            }

            let contentsAsHexString = contents; 
            if (!inHex) {
                contentsAsHexString = Utils.charactersToHexString(contents); // if not passed in hex, convert
            }

            const contentLength = contentsAsHexString.length; // length of the hex string
            const numberOfAvailableDataBlocks = this.getNumberOfAvailableDataBlocks(); // number of available data blocks
            // incorrectylt saying there is not space, there is enough for one more block
            if((contentLength/2) / MAX_DATA_SIZE > (numberOfAvailableDataBlocks + 1)) { // divide content length by 2 because and max_data_size is coutning 2 digits. +1 because it needs to count itself
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
                    let chunkOfContents = content.substring(0, MAX_DATA_SIZE * 2);
                    sessionStorage.setItem(dataBlockTSB, `1---${chunkOfContents}`) // make it unavailable before you get the next link so you do not overwrite it
                    let nextDataBlockTSB = this.getFirstAvailableDataBlock();
                    sessionStorage.setItem(dataBlockTSB, `1${nextDataBlockTSB}${chunkOfContents}`)
                    
                    // trim content to account for part of its data being gone
                    content = content.substring(MAX_DATA_SIZE * 2);
                    // set to the available data block
                    dataBlockTSB = nextDataBlockTSB;
                }
                
            }

            this.updateDiskTable();
            return 0; 

        }


        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted
        // 2 file name not found
        public readFile(fileName: string, inHex: boolean = false): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            if(this.getTSBFromFileName(fileName) === "") { // if TSB does not exist, return an error
                return 2; 
            }
            
            const tsb = this.getTSBFromFileName(fileName); 
            const data = this.getAllDataAsOneString(tsb); // this is all stores as one hex string
            let text = data; 
            if (!inHex) {
                text = Utils.hexStringToCharacters(data); // convert it to characters
            }

            READ_DATA = text; // set the global variable for the kernel to read
            return 0;
        }

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted 
        // 2 no files created
        public ls(all: boolean): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            // loop through the directories, get the file name of each file and convert it to a string, store it to an array
            // if the array is empty at the end of the loop, return 2 (no files currently exist)
            // otherwise join the array on " " and save it to a global variable
            let files:string[] = [];
            let value = "";
            for (let s = 0; s < NUM_SECTORS; s ++) {
                for (let b = 1; b < NUM_BLOCKS; b ++) {
                    // TSB 000 is reserved for the MBR so make the block start at 1 
                    value = sessionStorage.getItem(`0${s}${b}`)
                    if (value.substring(0,1) === "1") { // if the first character is a 0, that means it is not in use and its value should be returned
                        let hexString = value.substring(4); // remove the header
                        let hexBytes = parseInt(hexString.substring(0,2), 16);
                        console.log(hexBytes)
                        let firstCharacter = Utils.byteToChar(hexBytes);
                        console.log(firstCharacter)
                        if(all || (firstCharacter !== "$" && firstCharacter !== ".")) { // if its all, get everything. if not, ignore any file names starting with $ or .
                            while (hexString.length >= 2 && hexString.slice(-2) === "00") {
                                hexString = hexString.substring(0, hexString.length - 2); // Remove the last two characters
                            }
                            let fileName = Utils.hexStringToCharacters(hexString); // convert the hex to a string
                            files.push(fileName); // add it to the files array
                        } 
                    }
                }
            }

            // there were no files on disk
            if(files.length === 0) {
                return 2;
            }

            FILES_ON_DISK = files.join(" "); 
 
            return 0;
        }


        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted 
        // 2 original file name does not exist
        // 3 new file name already exists 
        public renameFile(originalFileName: string, newFileName: string): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            const tsb = this.getTSBFromFileName(originalFileName);

            if(tsb === "") { // if original file name does not exist
                return 2; 
            }

            if(this.getTSBFromFileName(newFileName) !== "") { // if new file name already exists
                return 3; 
            }

            let newFileNameAsHex = Utils.charactersToHexString(newFileName) // get the new file name as hex
            let value = sessionStorage.getItem(tsb); // the previous directory block
            let header = value.substring(0, 4); // preserve the header
            const zeroesNeeded = MAX_DATA_SIZE * 2 - newFileNameAsHex.length; // how many 0's to fill
            let updatedDirectoryBlock = header + newFileNameAsHex + "0".repeat(zeroesNeeded); 
            sessionStorage.setItem(tsb, updatedDirectoryBlock);
            
            this.updateDiskTable(); 

            return 0; 

        }

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted 
        // 2 file does not exist
        public deleteFile(fileName: string): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            const tsb = this.getTSBFromFileName(fileName);

            if(tsb === "") { // if TSB does not exist, return an error
                return 2; 
            }

            // loop through each of the data blocks and set their in use to 0
            let dataTSB = sessionStorage.getItem(tsb).substring(1, 4); // get the first tsb of the data block from the directory block
            // make all of the original data blocks not be in use
            while (dataTSB !== "---") {
                const currentData = sessionStorage.getItem(dataTSB);
                if (!currentData) {
                    break; 
                }
                let changedDataBlock = "0"+ sessionStorage.getItem(dataTSB).substring(1); // change the in use bit but keep rest of value
                sessionStorage.setItem(dataTSB, changedDataBlock)
                dataTSB = currentData.substring(1, 4); // set the currentTSB to the next link  
            }


            // make the directory no longer be in use
            let value = sessionStorage.getItem(tsb);
            value = "0" + value.substring(1); //update the in use bit to 0

            sessionStorage.setItem(tsb, value);

            this.updateDiskTable();
           
            return 0;
        }

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted 
        // 2 original file name does not exist
        // 3 new file name already exists 
        // 4 create failed
        // 5 write failed
        public copyFile(originalFileName: string, newFileName: string): number {
            if(!_DiskFormatted) {
                return 1; 
            }

            const tsb = this.getTSBFromFileName(originalFileName);

            if(tsb === "") { // if original file name does not exist
                return 2; 
            }

            if(this.getTSBFromFileName(newFileName) !== "") { // if new file name already exists
                return 3; 
            }

            // get the contents of the file. read will always work here
            this.readFile(originalFileName);
            const originalFileContents: string = READ_DATA;  

            // create the new file 
            const createResult = this.createFile(newFileName);
            if(createResult !== 0) {
                console.log(this.createFile(newFileName))
                return 4; 
            }

            const writeResult = this.writeFile(newFileName, originalFileContents); 
            if(writeResult !== 0) {
                console.log(this.writeFile(newFileName, originalFileContents))
                return 5; 
            }
            
            
            return 0; 
        }

        

        // return a value to the kernel based on if successful or went wrong
        // 0 okay
        // 1 disk not formatted 
        // 2 create failed
        // 3 write failed
        public createSwapFile(PID: number, contentForSwapFile: string):number {
            if(!_DiskFormatted) { // should never be called but want to be safe
                return 1; 
            }

            // create the file with the name 
            const swapFileName = "$" + PID; 
            const createFileResult = this.createFile(swapFileName);

            if(createFileResult !== 0) {
                return 2; 
            }

            // write to the file with the 0's added
            const zeroesNeeded = 5 * MAX_DATA_SIZE * 2 - contentForSwapFile.length; // 5 for the amount of blocks, MAX_DATA_SIZE * 2 for the individual block - length to not get extra 0's
            let program = contentForSwapFile + "0".repeat(zeroesNeeded); 
            


            const writeResult = this.writeFile(swapFileName, program, true); // pass true because it is already in hex

            if(writeResult !== 0) {
                this.deleteFile(swapFileName) // there was an error creating the swap file so make sure it can be written over
                return 3; 
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

        public getFirstAvailableDirectoryBlock(): string {
            // loop through the session storage for directories (only ones that start with 0), check the first bit. if there is a 0 available return its TSB string. if loop ends, return "";
            let value = "";
            for (let s = 0; s < NUM_SECTORS; s ++) {
                for (let b = 0; b < NUM_BLOCKS; b ++) {
                    if(s === 0 && b === 0) {
                        continue; // TSB 000 is reserved for the MBR so make it skip that loop
                    }
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
            let inUse = ""; 

            for (let t = 0; t < 1; t ++) {
                for (let s = 0; s < NUM_SECTORS; s ++) {
                    for (let b = 0; b < NUM_BLOCKS; b ++) {
                        value = sessionStorage.getItem(`${t}${s}${b}`); 
                        inUse = value.substring(0,1)
                        valueTrimmed = value.substring(4); // no header
                        valueTrimmed = valueTrimmed.substring(0, end); // trim the end if the file name is not max length
                        
                        if (inUse === "1" && fileNameAsHex === valueTrimmed) {
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
                hexString += currentData.substring(4); 
                dataTSB = currentData.substring(1, 4); // set the currentTSB to the next link  
            }

            // remove the trailing 0's 
            // i asked chat GPT 11/29/24 an effective way to deal with the 0's at the end. i thought since i know an even amount needs to come off, this would be okay
            // for example if the last character was represnted as 70, I do not want that coming off
            // but if it was 7000, i know that 00 means it is over. it needs iterate in chunks of 2 to solve this issue
            while (hexString.length >= 2 && hexString.slice(-2) === "00") {
                hexString = hexString.substring(0, hexString.length - 2); // Remove the last two characters
            }

            return hexString; 

        }

       

    
        
    }
}
