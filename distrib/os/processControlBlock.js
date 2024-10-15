var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        PID;
        priority;
        location;
        segment;
        base;
        limit;
        PC;
        acc;
        xReg;
        yReg;
        zFlag;
        Status;
        // chatGPT 9/24 helped me refactor this in a way so a row is not created during the shellRun
        // by having a tableRow, pcbs can be kept track of and dealt with as necessary
        tableRow = null;
        constructor(PID = 0, priority = 0, location = "", segment = 0, base = 0, limit = 0, PC = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, Status = "") {
            this.PID = PID;
            this.priority = priority;
            this.location = location;
            this.segment = segment;
            this.base = base;
            this.limit = limit;
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
            this.base = 0;
            this.limit = 0;
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
                for (let i = 0; i < 12; i++) {
                    this.tableRow.insertCell();
                }
            }
            // update cells
            this.tableRow.cells[0].innerHTML = TSOS.Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = TSOS.Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = TSOS.Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = TSOS.Utils.hexLog(this.base, 2, true);
            this.tableRow.cells[5].innerHTML = TSOS.Utils.hexLog(this.limit, 2, true);
            this.tableRow.cells[6].innerHTML = TSOS.Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[7].innerHTML = TSOS.Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[8].innerHTML = TSOS.Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[9].innerHTML = TSOS.Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[10].innerHTML = TSOS.Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[11].innerHTML = this.Status;
        }
        updateStatus(status) {
            this.Status = status;
        }
        updatePCBAfterDeallocated() {
            this.location = "N/A";
            this.segment = -1; // not available
            this.base = -1;
            this.limit = -1;
        }
        updateSegmentBaseAndLimit(segment) {
            this.segment = segment;
            this.base = segment * 256; // i thought this math to figure out the base and segment is pretty cool and avoids passing some parameters
            this.limit = segment * 256 + 256;
        }
        updateCPURegistersOnPCB() {
            this.tableRow.cells[0].innerHTML = TSOS.Utils.hexLog(this.PID, 2, true);
            this.tableRow.cells[1].innerHTML = TSOS.Utils.hexLog(this.priority, 2, true);
            this.tableRow.cells[2].innerHTML = this.location;
            this.tableRow.cells[3].innerHTML = TSOS.Utils.hexLog(this.segment, 2, true);
            this.tableRow.cells[4].innerHTML = TSOS.Utils.hexLog(this.base, 2, true);
            this.tableRow.cells[5].innerHTML = TSOS.Utils.hexLog(this.limit, 2, true);
            this.tableRow.cells[6].innerHTML = TSOS.Utils.hexLog(this.PC, 2, true);
            this.tableRow.cells[7].innerHTML = TSOS.Utils.hexLog(this.acc, 2, true);
            this.tableRow.cells[8].innerHTML = TSOS.Utils.hexLog(this.xReg, 2, true);
            this.tableRow.cells[9].innerHTML = TSOS.Utils.hexLog(this.yReg, 2, true);
            this.tableRow.cells[10].innerHTML = TSOS.Utils.hexLog(this.zFlag, 2, true);
            this.tableRow.cells[11].innerHTML = this.Status;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map