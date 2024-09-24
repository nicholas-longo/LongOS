var TSOS;
(function (TSOS) {
    class PCBManager {
        nextPID;
        pcbQueue;
        constructor() {
            this.nextPID = 0;
            this.pcbQueue = [];
        }
        // create a new PCB with a unique PID and return it
        createPCB(priority) {
            const pcb = new TSOS.ProcessControlBlock();
            pcb.init(this.nextPID); // get the new unique id for the pcb
            pcb.priority = priority;
            this.pcbQueue.push(pcb);
            this.nextPID++; // make sure to update the next pid when a new pcb is created
            return pcb;
        }
        // Chat GPT 9/22/24 
        // I asked it how to better refactor my pcbManager and it came up with the following methods below. Specificially,
        // I needed help with identifying a unique PCB so I can adjust its attributes, the find method was given to me and helps remedy that
        // Find PCB by PID
        findPCB(pid) {
            return this.pcbQueue.find(pcb => pcb.PID === pid);
        }
        // update the status of a PCB
        updatePCBStatus(pid, status) {
            const pcb = this.findPCB(pid);
            if (pcb) {
                pcb.updateStatus(status);
                pcb.updatePCBTable();
            }
        }
        // remove a PCB when terminated 
        // Chat GPT 9/22/24 
        // This was also part of the refactoring it gave me, and helps single out a specific pcb and get it out of the 
        // active pcb list so no changes can be made to it after the program was executed
        // TODO shellRun will need to take care of this step when it is over 
        terminatePCB(pid) {
            this.pcbQueue = this.pcbQueue.filter(pcb => pcb.PID !== pid);
        }
        getPCBs() {
            return this.pcbQueue;
        }
    }
    TSOS.PCBManager = PCBManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcbManager.js.map