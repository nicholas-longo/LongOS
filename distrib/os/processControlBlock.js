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
        updatePCBTable(pcbEntry) {
            // add the current pcb object to the table
            // eventually will need some logic for dealing with multiple of these
            let pcbTable = document.getElementById("pcbTable");
            let row = pcbTable.insertRow(); // make the row
            // fill the cells in
            let pidCell = row.insertCell();
            pidCell.innerHTML = pcbEntry.PID.toString(16).toUpperCase();
            let priorityCell = row.insertCell();
            priorityCell.innerHTML = pcbEntry.priority.toString();
            let locationCell = row.insertCell();
            locationCell.innerHTML = pcbEntry.location;
            let segmentCell = row.insertCell();
            segmentCell.innerHTML = pcbEntry.segment.toString();
            let pcCell = row.insertCell();
            pcCell.innerHTML = pcbEntry.PC.toString(16).toUpperCase(); // Again, assuming hexadecimal representation
            let accCell = row.insertCell();
            accCell.innerHTML = pcbEntry.acc.toString(16).toUpperCase();
            let xRegCell = row.insertCell();
            xRegCell.innerHTML = pcbEntry.xReg.toString(16).toUpperCase();
            let yRegCell = row.insertCell();
            yRegCell.innerHTML = pcbEntry.yReg.toString(16).toUpperCase();
            let zFlagCell = row.insertCell();
            zFlagCell.innerHTML = pcbEntry.zFlag.toString();
            let statusCell = row.insertCell();
            statusCell.innerHTML = pcbEntry.Status;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map