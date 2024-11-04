var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        runScheduledProcess(pid) {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map