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
            public base: number = 0, 
            public limit: number = 0,
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
            this.base = 0; 
            this.limit = 0; 
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
                for (let i = 0; i < 12; i++) {
                    this.tableRow.insertCell();
                }
            }

            // update cells
            this.tableRow.cells[0].innerHTML = Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = Utils.hexLog(this.base, 2, true);
            this.tableRow.cells[5].innerHTML = Utils.hexLog(this.limit, 2, true);
            this.tableRow.cells[6].innerHTML = Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[7].innerHTML = Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[8].innerHTML = Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[9].innerHTML = Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[10].innerHTML = Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[11].innerHTML = this.Status;
        }

        public updateStatus(status: string): void {
            this.Status = status;
        }

        public updatePCBAfterDeallocated(): void {
            this.location = "N/A";
            this.segment = -1; // not available
            this.base = -1;
            this.limit = -1;
        }

        public updateSegmentBaseAndLimit(segment: number): void {
            this.segment = segment;  
            this.base = segment * 0x100; // i thought this math to figure out the base and segment is pretty cool and avoids passing some parameters
            this.limit = segment * 0x100 + 0x100; 
        }

        public updateCPURegistersOnPCB(): void {
            this.PC = _CPU.PC;
            this.acc = _CPU.Acc;
            this.xReg = _CPU.Xreg;
            this.yReg = _CPU.Yreg; 
            this.zFlag = _CPU.Zflag;
           
            this.tableRow.cells[0].innerHTML = Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = Utils.hexLog(this.base, 2, true);
            this.tableRow.cells[5].innerHTML = Utils.hexLog(this.limit, 2, true);
            this.tableRow.cells[6].innerHTML = Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[7].innerHTML = Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[8].innerHTML = Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[9].innerHTML = Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[10].innerHTML = Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[11].innerHTML = this.Status;
        }

    }
}