module TSOS {

    export class Dispatcher {        
        constructor() {
        }

        public runScheduledProcess(pid: number): void {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
        }

        // save the state of the pcb
        public saveCurrentProcess(pid: number): void {
            const pcb = _PCBManager.findPCB(pid);
            
        }

        // remove it from the front of the readyQueue, move it to the back of the ready Queue
        public contextSwitch(pid: number): void {

        }

    }

}