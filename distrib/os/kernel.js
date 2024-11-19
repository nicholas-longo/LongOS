/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global objects.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _MemoryManager = new TSOS.MemoryManager(); // deals with allocation and memory protection
            _PCBManager = new TSOS.PCBManager(); // deals with creating and terminating pcb blocks
            _CPUScheduler = new TSOS.Scheduler();
            _CPUDispatcher = new TSOS.Dispatcher();
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // load the Disk System Device Driver
            this.krnTrace("Loading the disk system device driver.");
            _krnDiskSystemDeviceDriver = new TSOS.DiskSystemDeviceDriver(); // Construct it.
            this.krnTrace(_krnDiskSystemDeviceDriver.status);
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // initialize single step buttons
            this.initializeStepButtons();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        initializeStepButtons() {
            const toggleButton = document.getElementById('toggleButton');
            const stepButton = document.getElementById('stepButton');
            //Chat GPT 10/4/24 I asked for help on how to set up the event listeners to see when the button is pressed and act accordingly. It used the question mark in the syntax in order to make sure the buttons are not null or undefined '
            // If step ready is true, and isSingleStepMode is true, then one cycle will execute
            // If isSingleStepMode is false, then the cpu will just execute normally
            // toggle between single-step and normal mode
            toggleButton?.addEventListener('click', () => {
                _isSingleStepMode = !_isSingleStepMode;
                this.krnTrace(`Single-step mode: ${_isSingleStepMode ? 'ON' : 'OFF'}`);
                _stepReady = false; // reset step flag
            });
            // proceed one step if in single-step mode
            stepButton?.addEventListener('click', () => {
                if (_isSingleStepMode) {
                    _stepReady = true; // signal that we are ready to execute one step
                }
            });
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            _PCBManager.terminateAllReadyPCBs(); // update the status of all pcbs to Terminated
            _CPU.isExecuting = false; // turn off the cpu so it does not continue running any programs
            // I found this code on Josh Seligman's jOSh project. I was desperate to figure out how to turn off that hostlog. I had to...
            this.krnTrace('Shut down the CPU and HostLog.');
            clearInterval(_hardwareClockID);
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.
            */
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (!_CPU.isExecuting && _PCBManager.pcbReadyQueue.length > 0) { // inspiration from Josh Seligman's jOSh. I used it to see how to get the scheduler involved when a process is ready
                // if the cpu is off but the ready queue has an item, start scheduling
                _CPUScheduler.scheduleHeadProcess();
                this.krnTrace("Scheduling first process.");
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                // Chat GPT 10/4/24 I asked how to make my CPU execution step follow the necessary logic to be single step. It suggested this, where I check if I am in singleStepMode, and if I am, it waits for a step.
                // Once a step is had it executes, and resets the flags. The step only becomes true when I click the step button. Can toggle back and forth for the program. 
                // If single-step mode is enabled, only proceed when _stepReady is true
                if (_isSingleStepMode) {
                    if (!_stepReady) {
                        return; // Do not proceed until step button is clicked
                    }
                    _stepReady = false; // Reset the step flag after executing one cycle
                }
                _CPU.cycle();
                // loop through everything in the ready queue, if it has that status "ready" add 1 to the wait time. add 1 to the turnaround time as long as it is in the ready queue
                for (let process of _PCBManager.pcbReadyQueue) {
                    if (process.Status === "Ready") {
                        process.waitTime++;
                    }
                    process.turnAroundTime++;
                }
                _CurrentQuantumCount++; // increase the quantum value after each cycle
                _CPUScheduler.updateCurrentQuantumCount(); // update the screen of the current quantum count
                if (_CurrentQuantumCount >= _Quantum) { // when the quantum expires, reset the quantum count and call scheduling
                    _CurrentQuantumCount = 0;
                    _CPUScheduler.scheduleAfterQuantumExpired();
                }
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SOFTWARE_INTERRUPT:
                    this.krnTerminateProcess(params); // Handle process termination
                    _StdOut.advanceLine(); // when a process is done, advance the line
                    _StdOut.putPrompt();
                    break;
                // TODO: deal with tracking ATT and AWT
                case SYSTEM_CALL_PRINT_INT:
                    _StdOut.putText(params[0].toString()); // Print the Integer in the Y Register
                    break;
                case SYSTEM_CALL_PRINT_STRING:
                    let characterAsByte = params[0];
                    _StdOut.putText(TSOS.Utils.byteToChar(characterAsByte));
                    break;
                case INVALID_OP_CODE:
                    this.krnTerminateProcess(params); // Handle process termination
                    _StdOut.advanceLine();
                    _StdOut.putText("Invalid OP Code. Process terminated.");
                    _StdOut.advanceLine();
                    _StdOut.putPrompt();
                    break;
                case MEMORY_OUT_OF_BOUNDS_EXCEPTION:
                    this.krnTerminateProcess(params); // Handle process termination
                    _StdOut.advanceLine();
                    _StdOut.putText("Memory out of bounds exception. Process terminated.");
                    _StdOut.advanceLine();
                    _StdOut.putPrompt();
                    break;
                case DISPATCHER_RUN_HEAD:
                    this.krnTrace("Dispatcher called. Starting execution of the head process in the ready queue.");
                    _CPUDispatcher.runScheduledProcess(params);
                    break;
                case DISPATCHER_SAVE_PROCESS:
                    this.krnTrace("Dispatcher called. Saving state of the current process.");
                    _CPUDispatcher.saveCurrentProcess(params);
                    break;
                case DISPATCHER_MOVE_PROCESS:
                    this.krnTrace("Dispatcher called. Moving head of ready queue to back.");
                    _CPUDispatcher.contextSwitch();
                    break;
                case DISPATCHER_LOAD_REGISTERS_AFTER_TERMINATION:
                    this.krnTrace("Dispatcher called. Loading CPU with the correct registers.");
                    _CPUDispatcher.loadRegistersAfterTermination();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTerminateProcess(pid) {
            // Terminate the process
            const pcb = _PCBManager.findPCB(pid);
            this.krnTrace(`Process ${pid} terminated.`);
            _MemoryManager.deallocateSegement(_PCBManager.getPCBSegment(pid)); // Deallocate memory. call before the PID gets removed and becomes invalid
            _PCBManager.updatePCBStatus(pid, "Terminated"); // this will also write the current cpu registers into the pcb table
            _PCBManager.terminatePCB(pid); // Remove from both queues
            // clear the registers, update the cpu, and update the CPU table
            _CPU.init();
            TSOS.Control.updateCPUTable();
            _CurrentQuantumCount = 0; // reset the quantum count; 
            _CPUScheduler.updateCurrentQuantumCount();
            // print the turnaround time and wait time for the process
            _StdOut.advanceLine();
            _StdOut.putText(`Process ${pid} turnaround time: ${pcb.turnAroundTime}`);
            _StdOut.advanceLine();
            _StdOut.putText(`Process ${pid} wait time: ${pcb.waitTime}`);
            // call the scheduler to envoke another scheduling event
            _CPUScheduler.scheduleNextProcessAfterTermination();
        }
        krnTerminateAllProcesses(pidList) {
            // same logic as the terminate process just do it all at once here with for loop
            for (let i = 0; i < pidList.length; i++) {
                let pcb = _PCBManager.findPCB(pidList[i]);
                this.krnTrace(`Process ${pidList[i]} terminated.`);
                _MemoryManager.deallocateSegement(_PCBManager.getPCBSegment(pidList[i])); // Deallocate memory. call before the PID gets removed and becomes invalid
                _PCBManager.updatePCBStatus(pidList[i], "Terminated"); // this will also write the current cpu registers into the pcb table
                _PCBManager.terminatePCB(pidList[i]); // Remove from both queues
                // print the turnaround and wait times for all of the pcbs that were killed
                _StdOut.advanceLine();
                _StdOut.putText(`Process ${pidList[i]} turnaround time: ${pcb.turnAroundTime}`);
                _StdOut.advanceLine();
                _StdOut.putText(`Process ${pidList[i]} wait time: ${pcb.waitTime}`);
            }
            _CPU.init(); // turn the cpu off when the process is terminated and reset the registers
            TSOS.Control.updateCPUTable();
            _CurrentQuantumCount = 0; // reset the quantum count; 
            _CPUScheduler.updateCurrentQuantumCount();
            // no need to call a scheduling event because all of the processes were killed
        }
        krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        krnTrace(msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            //TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            const display = _DrawingContext;
            display.fillStyle = "blue";
            display.fillRect(0, 0, 500, 500); // hard coded width and height from canvas in index
            display.fillStyle = "white";
            display.fillText("It's so over.. you are gonna have to restart this.", 125, 250);
            _Kernel.krnShutdown(); // shutdown the OS if a BSOD is called
            this.krnShutdown();
        }
        clearMemory() {
            if (_CPU.isExecuting) {
                _StdOut.putText("Cannot clear the memory as the CPU is executing");
            }
            else {
                _MemoryManager.clearMemory();
                _StdOut.putText("All memory segments cleared.");
            }
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map