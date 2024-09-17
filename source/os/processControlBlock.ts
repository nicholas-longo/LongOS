module TSOS {

    export class ProcessControlBlock {
        constructor ( 
            public PID: number = 0, 
            public priority: number = 0,
            public location: string = "",
            public PC: number = 0,
            public acc: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0,
            public Status: string = "") {
                    
        }
        
        public init(): void {
            this.PID = 0; 
            this.priority = 0; 
            this.location = "";
            this.PC = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.Status = "";
        }
    }
}