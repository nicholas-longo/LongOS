module TSOS {

    export class ProcessControlBlock {
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
            this.PID = 0; 
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
            // add the current pcb object to the table
            // eventually will need some logic for dealing with multiple of these
            let pcbTable = document.getElementById("pcbTable") as HTMLTableElement;
            let row = pcbTable.insertRow(); // make the row

            // fill the cells in
            row.insertCell().innerHTML = Utils.hexLog(this.PID, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.priority, 2, true);
            row.insertCell().innerHTML = this.location;
            row.insertCell().innerHTML = Utils.hexLog(this.segment, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.PC, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.acc, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.xReg, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.yReg, 2, true);
            row.insertCell().innerHTML = Utils.hexLog(this.zFlag, 2, true);
            row.insertCell().innerHTML = this.Status;
        }

        public updateStatus(status: string): void {
            console.log(status)
            this.Status = status;
        }

    }
}