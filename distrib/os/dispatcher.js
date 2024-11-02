var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        runScheduledProcess(pid) {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
            _StdOut.putText(`Executing process ${pid}`);
            _StdOut.advanceLine();
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map