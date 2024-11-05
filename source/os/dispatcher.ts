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
            
            
        }
    }

}