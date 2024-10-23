module TSOS {

    export class Scheduler {        
        private quantum: number = 6
        
        constructor() {
        }

        public setQuantum(quantum: number): void {
            this.quantum = quantum;
            this.updateQuantumLabel(); 
        }

        public updateQuantumLabel(): void {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = this.quantum.toString(); 
        }
    }

}