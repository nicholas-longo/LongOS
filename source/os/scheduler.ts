module TSOS {

    export class Scheduler {        
        private quantum: number = 6
        
        constructor() {
        }

        public setQuantum(quantum: number): void {
            this.quantum = quantum;
        }
    }

}