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
        
        public init(): void {
            this.PID = 0; 
            this.priority = 0; 
            this.location = "Memory";
            this.segment = 0; 
            this.PC = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.Status = "Resident";
        }


        public updatePCBTable(pcbEntry : ProcessControlBlock): void {
            // add the current pcb object to the table
            // eventually will need some logic for dealing with multiple of these
            let pcbTable = document.getElementById("pcbTable") as HTMLTableElement;
            let row = pcbTable.insertRow(); // make the row

            // fill the cells in

            let pidCell = row.insertCell();
            pidCell.innerHTML = Utils.hexLog(pcbEntry.PID, 2, true);
            
            let priorityCell = row.insertCell();
            priorityCell.innerHTML = Utils.hexLog(pcbEntry.priority, 2, true);;
            
            let locationCell = row.insertCell();
            locationCell.innerHTML = pcbEntry.location;

            let segmentCell = row.insertCell();
            segmentCell.innerHTML = Utils.hexLog(pcbEntry.segment, 2, true);;
            
            let pcCell = row.insertCell();
            pcCell.innerHTML = Utils.hexLog(pcbEntry.PC, 2, true);
            
            let accCell = row.insertCell();
            accCell.innerHTML = Utils.hexLog(pcbEntry.acc, 2, true);
            
            let xRegCell = row.insertCell();
            xRegCell.innerHTML = Utils.hexLog(pcbEntry.xReg, 2, true);
            
            let yRegCell = row.insertCell();
            yRegCell.innerHTML = Utils.hexLog(pcbEntry.yReg, 2, true);
            
            let zFlagCell = row.insertCell();
            zFlagCell.innerHTML = Utils.hexLog(pcbEntry.zFlag, 2, true);
            
            let statusCell = row.insertCell();
            statusCell.innerHTML = pcbEntry.Status;
        }

    }
}