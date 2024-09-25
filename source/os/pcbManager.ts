module TSOS {
    export class PCBManager {
        private nextPID: number;
        private pcbReadyQueue: ProcessControlBlock[];
        private pcbQueue: ProcessControlBlock[]; 

        constructor() {
            this.nextPID = 0; 
            this.pcbReadyQueue = [];
            this.pcbQueue = []; 
        }

        // create a new PCB with a unique PID and return it
        public createPCB(priority: number): ProcessControlBlock {
            const pcb = new ProcessControlBlock();
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
        public findPCB(pid: number): ProcessControlBlock | undefined {
            return this.pcbQueue.find(pcb => pcb.PID === pid);
        }

        // update the status of a PCB
        public updatePCBStatus(pid: number, status: string): void {
            const pcb = this.findPCB(pid);
            if (pcb) {
                pcb.updateStatus(status); 
                pcb.updatePCBTable(); 
                if (status === "Ready") {
                    this.pcbReadyQueue.push(pcb); // Chat GPT 9/25/24 helped me find where to add a pcb to the ready queue. I knew it was when it was "ready," but I did not know the best place to do so
                }
            }
        }

        // remove a PCB when terminated 
        // Chat GPT 9/22/24 
        // This was also part of the refactoring it gave me, and helps single out a specific pcb and get it out of the 
        // active pcb list so no changes can be made to it after the program was executed
        // TODO shellRun will need to take care of this step when it is over 
        public terminatePCB(pid: number): void {
            this.pcbQueue = this.pcbQueue.filter(pcb => pcb.PID !== pid);
            this.pcbReadyQueue = this.pcbReadyQueue.filter(pcb => pcb.PID !== pid);
        }

        public getPCBs(): ProcessControlBlock[] {
            return this.pcbQueue;
        }

        public getFirstReadyProcess(): ProcessControlBlock | undefined {
            return this.pcbReadyQueue[0]; 
        }

        // Chat GPT 9/25/2024 this is going to be more useful for project 3, but for now it can still be used. This is called when the kernel is checking if there is anything else left in the readyQueue before ending the cpu execution
        public getNextReadyProcess(): ProcessControlBlock | undefined {
            return this.pcbReadyQueue.shift(); // Get the next ready process
        }

        // used for memory deallocation
        public getPCBSegment(pid): number {
            const pcb = this.findPCB(pid)
            return pcb.segment; 
        }

    }
}