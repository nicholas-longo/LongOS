module TSOS {

    export class Dispatcher {        
        constructor() {
        }
        
        private PCBDictionary: { [pid: number]: TSOS.ProcessControlBlock } = {};

        public runScheduledProcess(pid: number): void {
            
            const pcb = _PCBManager.findPCB(pid);
            pcb.updateStatus("Running");

            // Update the PCB table for the new process
            pcb.updatePCBTable();
           
            _CPU.isExecuting = true;

        }

        // save the state of the pcb
        public saveCurrentProcess(pid: number): void {
            const pcb = _PCBManager.findPCB(pid);
            this.PCBDictionary[pid] = pcb; // add or update the dictionary entry for a specific PID; 
            
        }
        
        // remove it from the front of the readyQueue, move it to the back of the ready Queue. load the cpu with the current values of the new pcb
        public contextSwitch(): void {
            if(_PCBManager.pcbReadyQueue.length > 1) {
                const prevHeadPCB = _PCBManager.pcbReadyQueue.shift(); // get the head PCB

                _PCBManager.pcbReadyQueue.push(prevHeadPCB); // move it to the back of the ready queue
                
                const newHeadPCB = _PCBManager.pcbReadyQueue[0]; // get the new head
                
                // update the necessary CPU registers 
                _CPU.PC = newHeadPCB.PC
                _CPU.IR = newHeadPCB.IR
                _CPU.Acc = newHeadPCB.acc
                _CPU.Xreg = newHeadPCB.xReg
                _CPU.Yreg = newHeadPCB.yReg
                _CPU.Zflag = newHeadPCB.zFlag


                Control.updateCPUTable(); // update the CPU table
            }
            
        }

        // take the head process and make sure the cpu starts off with those registers
        public loadRegistersAfterTermination(): void {
            const pcb = _PCBManager.pcbReadyQueue[0];
            console.log(pcb.PID);

            _CPU.PC = pcb.PC
            _CPU.IR = pcb.IR
            _CPU.Acc = pcb.acc
            _CPU.Xreg = pcb.xReg
            _CPU.Yreg = pcb.yReg
            _CPU.Zflag = pcb.zFlag

        }
    }

}

