module TSOS {

    export class Scheduler {        
        
        constructor() {
        }

        public scheduleHeadProcess(): void {
            // take the element at the front of the ready queue, pass it to the dispatcher through an interrupt
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_RUN_HEAD, _PCBManager.getFirstReadyProcess().PID));
        }

        
        // call dispatcher to save current process state and move the process to the back of the queue
        // then call the dispatcher to run the head of the queue
        public scheduleAfterQuantumExpired(): void {
            const pcb = _PCBManager.getFirstReadyProcess()
            pcb.updateCPURegistersOnPCB(); // when the quantum expires, must update the pcb with current cpu registers
 
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_SAVE_PROCESS, pcb.PID));
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_MOVE_PROCESS, [0])); // the param does not matter for this call
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_RUN_HEAD, pcb.PID));
        }
        
        // function to be called that deals when a process in the ready queue is terminated and context needs to change
        public scheduleNextProcessAfterTermination(): void {
            // if there is another process in the ready queue when one is terminated, schedule it
            if (_PCBManager.pcbReadyQueue.length > 0) {
                this.loadRegistersAfterPCBTerminated(); 
                this.scheduleHeadProcess(); 
            }
        }

        // since the cpu registers will erase after a process is terminated, this will allow me to quickly update them to allow the programs to work correctly together
        public loadRegistersAfterPCBTerminated(): void {
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_LOAD_REGISTERS_AFTER_TERMINATION, [0]));
        }
        
        public setQuantum(quantum: number): void {
            _Quantum = quantum;
            this.updateQuantumLabel(); 
        }

        public updateQuantumLabel(): void {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = _Quantum.toString(); 
        }

        // update the display of the current quantum count
        public updateCurrentQuantumCount(): void {
            let currentQuantumCount = document.getElementById("currentQuantumCount");
            currentQuantumCount.innerText = _CurrentQuantumCount.toString();
        }
    }

}