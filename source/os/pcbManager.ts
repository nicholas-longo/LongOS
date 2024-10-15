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

        // Chat GPT 10/7/24
        // I asked for a way to identify a pcb in a way that would be recognized by the memory manager in order for updating the PCB table during memory allocation, and it suggested to implement this helper
        // function to find a pcb based on the segment number it is currently assigned
        public findPCBBySegment(segment: number): ProcessControlBlock | undefined {
            return this.pcbQueue.find(pcb => pcb.segment === segment);
        }

        // update the status of a PCB
        public updatePCBStatus(pid: number, status: string): void {
            const pcb = this.findPCB(pid);
            if (pcb) {
                pcb.updateStatus(status); 
                if (status === "Ready") {
                    this.pcbReadyQueue.push(pcb); // Chat GPT 9/25/24 helped me find where to add a pcb to the ready queue. I knew it was when it was "ready," but I did not know the best place to do so
                }
                if(status === "Terminated"){
                    pcb.updateCPURegistersOnPCB(); // makes sure when a program is terminated, it will be updated with the current cpu's registers and not overwritten 
                } else {
                    pcb.updatePCBTable();
                }
            }
        }

        public updatePCBSegment(pid: number, segment: number): void {
            const pcb = this.findPCB(pid);
            pcb.updateSegemnt(segment); // the segment is obtained through the memory manager
        }

        // when a process is deallocated from memory, this will fix the PCB table
        public updatePCBAfterDeallocated(segment: number): void {
            const pcb = this.findPCBBySegment(segment);
            console.log(pcb)
            if (pcb) {
                pcb.updatePCBAfterDeallocated(); // this will make the location, segment, base, and limit all something that indicates it does not exist
                pcb.updatePCBTable(); // reflect the changes
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

            // add in the ending result of the pcb. will need to change for project 3, for now it just has to update at the end

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

        public updateCPURegistersOnPCB(pid): void {
            const pcb = this.findPCB(pid);
            pcb.updateCPURegistersOnPCB(); // gets the values of the CPU registers and updates the PCB accordingly
        }

        // called if there is a shutdown
        public terminateAllReadyPCBs(): void {
            while (this.pcbReadyQueue.length > 0) {
                const pcb = this.getNextReadyProcess(); // get a pcb and then remove it
                if (pcb) {
                    this.updatePCBStatus(pcb.PID, "Terminated");
                }
            }
        }

    }
}