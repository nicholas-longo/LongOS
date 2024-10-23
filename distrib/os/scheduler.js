var TSOS;
(function (TSOS) {
    class Scheduler {
        quantum = 6;
        constructor() {
        }
        setQuantum(quantum) {
            this.quantum = quantum;
            this.updateQuantumLabel();
        }
        updateQuantumLabel() {
            const quantumLabel = document.getElementById("quantumValue");
            quantumLabel.innerText = this.quantum.toString();
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map