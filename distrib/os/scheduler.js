var TSOS;
(function (TSOS) {
    class Scheduler {
        quantum = 6;
        constructor() {
        }
        setQuantum(quantum) {
            this.quantum = quantum;
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map