var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
        }
        scheduleHeadProcess() {
            // take the element at the front of the ready queue, pass it to the dispatcher through an interrupt
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_RUN_HEAD, _PCBManager.getFirstReadyProcess().PID));
        }
        // call dispatcher to save current process state and move the process to the back of the queue
        // then call the dispatcher to run the head of the queue
        scheduleAfterQuantumExpired() {
            const pcb = _PCBManager.getFirstReadyProcess();
            pcb.updateCPURegistersOnPCB(); // when the quantum expires, must update the pcb with current cpu registers
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_SAVE_PROCESS, _PCBManager.getFirstReadyProcess().PID));
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_MOVE_PROCESS, [0])); // the param does not matter for this call
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISPATCHER_RUN_HEAD, _PCBManager.getFirstReadyProcess().PID));
        }
        // function to be called that deals when a process in the ready queue is terminated and context needs to change
        scheduleNextProcessAfterTermination() {
            // if there is another process in the ready queue when one is terminated, schedule it
            if (_PCBManager.pcbReadyQueue.length > 0) {
                this.scheduleHeadProcess();
            }
        }
        setQuantum(quantum) {
            _Quantum = quantum;
            this.updateQuantumLabel();
        }
        updateQuantumLabel() {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = _Quantum.toString();
        }
        // update the display of the current quantum count
        updateCurrentQuantumCount() {
            let currentQuantumCount = document.getElementById("currentQuantumCount");
            currentQuantumCount.innerText = _CurrentQuantumCount.toString();
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map