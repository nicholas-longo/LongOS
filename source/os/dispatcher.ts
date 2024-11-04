module TSOS {

    export class Dispatcher {        
        constructor() {
        }

        public runScheduledProcess(pid: number): void {
            _PCBManager.updatePCBStatus(pid, "Running");
            _CPU.isExecuting = true;
            
        }

    }

}