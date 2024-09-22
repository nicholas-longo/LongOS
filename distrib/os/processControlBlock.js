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
        init(pid) {
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
        updatePCBTable() {
            // add the current pcb object to the table
            // eventually will need some logic for dealing with multiple of these
            let pcbTable = document.getElementById("pcbTable");
            let row = pcbTable.insertRow(); // make the row
            // fill the cells in
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.PID, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.priority, 2, true);
            row.insertCell().innerHTML = this.location;
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.segment, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.PC, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.acc, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.xReg, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.yReg, 2, true);
            row.insertCell().innerHTML = TSOS.Utils.hexLog(this.zFlag, 2, true);
            row.insertCell().innerHTML = this.Status;
        }
        updateStatus(status) {
            this.Status = status;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map