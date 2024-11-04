module TSOS {

    export class Scheduler {        
        
        constructor() {
        }

        public scheduleHeadProcess(): void {
            // take the element at the front of the ready queue, pass it to the dispatcher through an interrupt
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_RUN_HEAD, _PCBManager.getFirstReadyProcess().PID));
        }

        // function to be called that deals when a process in the ready queue is terminated and context needs to change
        public scheduleNextProcessAfterTermination(): void {
            // if there is another process in the ready queue when one is terminated, schedule it
            if (_PCBManager.pcbReadyQueue.length > 0) {
                this.scheduleHeadProcess(); 
            }
        }

        public setQuantum(quantum: number): void {
            _Quantum = quantum;
            this.updateQuantumLabel(); 
        }

        public updateQuantumLabel(): void {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = _Quantum.toString(); 
        }
    }

}