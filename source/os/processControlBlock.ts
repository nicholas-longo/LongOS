module TSOS {

    export class ProcessControlBlock {
        // chatGPT 9/24 helped me refactor this in a way so a row is not created during the shellRun
        // by having a tableRow, pcbs can be kept track of and dealt with as necessary
        private tableRow: HTMLTableRowElement | null = null; 
        
        constructor ( 
            public PID: number = 0, 
            public priority: number = 0,
            public location: string = "",
            public segment: number = 0,
            public PC: number = 0,
            public acc: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0,
            public Status: string = "") {
                    
        }
        
        public init(pid: number): void {
            this.PID = pid; 
            this.priority = 8; 
            this.location = "Memory";
            this.segment = 0; 
            this.PC = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.Status = "Resident";
        }


        public updatePCBTable(): void {
            if (!this.tableRow) {
                // only create a new row if the PCB does not already exist 
                let pcbTable = document.getElementById("pcbTable") as HTMLTableElement;
                this.tableRow = pcbTable.insertRow();
                for (let i = 0; i < 10; i++) {
                    this.tableRow.insertCell();
                }
            }

            // update cells
            this.tableRow.cells[0].innerHTML = Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[5].innerHTML = Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[6].innerHTML = Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[7].innerHTML = Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[8].innerHTML = Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[9].innerHTML = this.Status;
        }

        public updateStatus(status: string): void {
            this.Status = status;
        }

        public updatePCBAfterDeallocated(): void {
            this.location = "N/A";
            this.segment = -1; // not available
            // for project 3
            // this.base = -1
            // this.limit = -1
        }

        public updateCPURegistersOnPCB(): void {
            this.tableRow.cells[0].innerHTML = Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = Utils.hexLog(_CPU.PC, 2, true);
            this.tableRow.cells[5].innerHTML = Utils.hexLog(_CPU.Acc, 2, true);
            this.tableRow.cells[6].innerHTML = Utils.hexLog(_CPU.Xreg, 2, true);
            this.tableRow.cells[7].innerHTML = Utils.hexLog(_CPU.Yreg, 2, true);
            this.tableRow.cells[8].innerHTML = Utils.hexLog(_CPU.Zflag, 2, true);
            this.tableRow.cells[9].innerHTML = this.Status;
        }

    }
}