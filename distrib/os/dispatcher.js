var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        runScheduledProcess(pid) {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
        }
        // save the state of the pcb
        saveCurrentProcess(pid) {
            const pcb = _PCBManager.findPCB(pid);
        }
        // remove it from the front of the readyQueue, move it to the back of the ready Queue
        contextSwitch(pid) {
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map