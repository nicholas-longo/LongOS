module TSOS {

    export class Scheduler {        
        private quantum: number = 6
        
        constructor() {
        }

        public scheduleFirstProcess(): void {
            // take the element at the front of the ready queue, pass it to the dispatcher through an interrupt
            _KernelInterruptQueue.enqueue(new Interrupt(DISPATCHER_RUN_HEAD, _PCBManager.getFirstReadyProcess().PID));
        }

        public setQuantum(quantum: number): void {
            this.quantum = quantum;
            this.updateQuantumLabel(); 
        }

        public updateQuantumLabel(): void {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = this.quantum.toString(); 
        }
    }

}