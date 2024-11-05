module TSOS {

    export class Dispatcher {        
        constructor() {
        }
        
        private PCBDictionary: { [pid: number]: TSOS.ProcessControlBlock } = {};

        public runScheduledProcess(pid: number): void {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
        }

        // save the state of the pcb
        public saveCurrentProcess(pid: number): void {
            const pcb = _PCBManager.findPCB(pid);
            this.PCBDictionary[pid] = pcb; 
            
        }
        
        // remove it from the front of the readyQueue, move it to the back of the ready Queue. load the cpu with the current values of the new pcb
        public contextSwitch(): void {
            const prevHeadPCB = _PCBManager.pcbReadyQueue.shift(); // get the head PCB
            _PCBManager.pcbReadyQueue.push(prevHeadPCB); // move it to the back of the ready queue
            
            const newHeadPCB = _PCBManager.pcbReadyQueue[0]; 
            _CPU.PC
            _CPU.Acc
            
        }
    }

}

// TODO fix how the display always says running
// pcb.updateStatus("Ready");
// pcb.updateCPURegistersOnPCB(); // called because it does not wipe out the values of the cpu registers on the pcb. it updates the entire table

// find out where to put that code
