var TSOS;
(function (TSOS) {
    class PCBManager {
        nextPID;
        pcbs; // Collection of PCBs
        constructor() {
            this.nextPID = 0;
            this.pcbs = [];
        }
    }
    TSOS.PCBManager = PCBManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcbManager.js.map