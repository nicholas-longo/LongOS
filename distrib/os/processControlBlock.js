var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        PID;
        priority;
        location;
        segment;
        PC;
        acc;
        xReg;
        yReg;
        zFlag;
        Status;
        constructor(PID = 0, priority = 0, location = "", segment = 0, PC = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, Status = "") {
            this.PID = PID;
            this.priority = priority;
            this.location = location;
            this.segment = segment;
            this.PC = PC;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.Status = Status;
        }
        init() {
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
        updatePCBTable(pcbEntry) {
            // add the current pcb object to the table
            // eventually will need some logic for dealing with multiple of these
            let pcbTable = document.getElementById("pcbTable");
            let row = pcbTable.insertRow(); // make the row
            // fill the cells in
            let pidCell = row.insertCell();
            pidCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.PID, 2, true);
            let priorityCell = row.insertCell();
            priorityCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.priority, 2, true);
            ;
            let locationCell = row.insertCell();
            locationCell.innerHTML = pcbEntry.location;
            let segmentCell = row.insertCell();
            segmentCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.segment, 2, true);
            ;
            let pcCell = row.insertCell();
            pcCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.PC, 2, true);
            let accCell = row.insertCell();
            accCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.acc, 2, true);
            let xRegCell = row.insertCell();
            xRegCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.xReg, 2, true);
            let yRegCell = row.insertCell();
            yRegCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.yReg, 2, true);
            let zFlagCell = row.insertCell();
            zFlagCell.innerHTML = TSOS.Utils.hexLog(pcbEntry.zFlag, 2, true);
            let statusCell = row.insertCell();
            statusCell.innerHTML = pcbEntry.Status;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map