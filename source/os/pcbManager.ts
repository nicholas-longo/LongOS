module TSOS {

    export class PCBManager {
        private nextPID: number;
        private pcbs: ProcessControlBlock[]; // Collection of PCBs

        constructor() {
            this.nextPID = 0; 
            this.pcbs = []; 
        }
    }
}