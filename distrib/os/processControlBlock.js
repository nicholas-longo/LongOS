var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        PID;
        priority;
        location;
        PC;
        acc;
        xReg;
        yReg;
        zFlag;
        Status;
        constructor(PID = 0, priority = 0, location = "", PC = 0, acc = 0, xReg = 0, yReg = 0, zFlag = 0, Status = "") {
            this.PID = PID;
            this.priority = priority;
            this.location = location;
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
            this.location = "";
            this.PC = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.Status = "";
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map