var TSOS;
(function (TSOS) {
    class Scheduler {
        quantum = 6;
        constructor() {
        }
        scheduleHeadProcess() {
            // take the element at the front of the ready queue, pass it to the dispatcher through an interrupt
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
            this.quantum = quantum;
            this.updateQuantumLabel();
        }
        updateQuantumLabel() {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = this.quantum.toString();
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map