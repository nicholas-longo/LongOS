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
            const prevHeadPCB = _PCBManager.pcbReadyQueue.shift(); // get the head PCB
            _PCBManager.pcbReadyQueue.push(prevHeadPCB); // move it to the back of the ready queue
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map