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
        // chatGPT 9/24 helped me refactor this in a way so a row is not created during the shellRun
        // by having a tableRow, pcbs can be kept track of and dealt with as necessary
        tableRow = null;
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
        updatePCBTable() {
            if (!this.tableRow) {
                // only create a new row if the PCB does not already exist 
                let pcbTable = document.getElementById("pcbTable");
                this.tableRow = pcbTable.insertRow();
                for (let i = 0; i < 10; i++) {
                    this.tableRow.insertCell();
                }
            }
            // update cells
            this.tableRow.cells[0].innerHTML = TSOS.Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = TSOS.Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = TSOS.Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = TSOS.Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[5].innerHTML = TSOS.Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[6].innerHTML = TSOS.Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[7].innerHTML = TSOS.Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[8].innerHTML = TSOS.Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[9].innerHTML = this.Status;
        }
        updateStatus(status) {
            this.Status = status;
        }
        updateCPURegistersOnPCB() {
            this.tableRow.cells[0].innerHTML = TSOS.Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = TSOS.Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = TSOS.Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = TSOS.Utils.hexLog(_CPU.PC, 2, true);
            this.tableRow.cells[5].innerHTML = TSOS.Utils.hexLog(_CPU.Acc, 2, true);
            this.tableRow.cells[6].innerHTML = TSOS.Utils.hexLog(_CPU.Xreg, 2, true);
            this.tableRow.cells[7].innerHTML = TSOS.Utils.hexLog(_CPU.Yreg, 2, true);
            this.tableRow.cells[8].innerHTML = TSOS.Utils.hexLog(_CPU.Zflag, 2, true);
            this.tableRow.cells[9].innerHTML = this.Status;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map