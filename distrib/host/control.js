/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            Control.updateCPUTable();
            _Memory = new TSOS.Memory();
            _Memory.init();
            Control.intializeMemoryTable(); // create the memory table
            _MemoryAccessor = new TSOS.MemoryAccessor(_Memory);
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
        }
        static intializeMemoryTable() {
            // add the necessary rows to the memory table, starting at 0x000 and counting up by 8 until 0x100 can be displayed
            let memTable = document.getElementById("memoryTable"); // this allows me to use insertRow()
            // change the mem table size later
            for (let i = 0x000; i < 0x100; i += 8) {
                // create the address columns
                let row = memTable.insertRow();
                let addressCell = row.insertCell();
                addressCell.innerHTML = TSOS.Utils.hexLog(i, 3); // i will be converted into a hex number with a three digit length, for example when i is 8, hexLog(i, 3) will return 0x008
                for (let j = 0x01; j <= 0x08; j++) {
                    let cell = row.insertCell();
                    cell.innerHTML = "00"; // fill in the rest of the space with 0's 
                }
            }
        }
        static updateMemory() {
            let memTable = document.getElementById("memoryTable");
            const memory = _MemoryAccessor.getMemory(); // the current memory array
            for (let i = 0; i < memTable.rows.length; i++) {
                const row = memTable.rows[i];
                for (let j = 1; j < row.cells.length; j++) {
                    const cell = row.cells[j];
                    const index = i * 8 + (j - 1); // *8 to account for the current row, j - 1 because j starts at 1
                    cell.innerHTML = memory[index].toString(16).toUpperCase(); // converts a number into a hexidecimal string. i am avoiding the hexLog function because I do not want padding
                }
            }
        }
        // used for displaying the cpu to the console
        static updateCPUTable() {
            // get the table 
            let cpuTable = document.getElementById("cpuTable");
            // get the starting values of the cpu
            const PC = _CPU.PC;
            const accumulator = _CPU.Acc;
            const xReg = _CPU.Xreg;
            const yReg = _CPU.Yreg;
            const zFlag = _CPU.Zflag;
            // create the cells accordingly 
            let row = cpuTable.insertRow();
            // create and fill the cells with the corresponding values
            let pcCell = row.insertCell();
            pcCell.innerHTML = PC.toString(16).toUpperCase();
            let accCell = row.insertCell();
            accCell.innerHTML = accumulator.toString(16).toUpperCase();
            let xRegCell = row.insertCell();
            xRegCell.innerHTML = xReg.toString(16).toUpperCase();
            let yRegCell = row.insertCell();
            yRegCell.innerHTML = yReg.toString(16).toUpperCase();
            let zFlagCell = row.insertCell();
            zFlagCell.innerHTML = zFlag.toString();
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map