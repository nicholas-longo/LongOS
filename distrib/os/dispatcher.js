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
            const newHeadPCB = _PCBManager.pcbReadyQueue[0]; // get the new head
            // update the necessary CPU registers 
            _CPU.PC = newHeadPCB.PC;
            _CPU.IR = newHeadPCB.IR;
            _CPU.Acc = newHeadPCB.acc;
            _CPU.Xreg = newHeadPCB.xReg;
            _CPU.Yreg = newHeadPCB.yReg;
            _CPU.Zflag = newHeadPCB.zFlag;
            TSOS.Control.updateCPUTable(); // update the CPU table
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
// TODO fix how the display always says running
// pcb.updateStatus("Ready");
// pcb.updateCPURegistersOnPCB(); // called because it does not wipe out the values of the cpu registers on the pcb. it updates the entire table
// find out where to put that code
//# sourceMappingURL=dispatcher.js.map