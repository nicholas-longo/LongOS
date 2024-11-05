var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        PCBDictionary = {};
        runScheduledProcess(pid) {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
        }
        // save the state of the pcb
        saveCurrentProcess(pid) {
            const pcb = _PCBManager.findPCB(pid);
            this.PCBDictionary[pid] = pcb;
        }
        // remove it from the front of the readyQueue, move it to the back of the ready Queue. load the cpu with the current values of the new pcb
        contextSwitch() {
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map