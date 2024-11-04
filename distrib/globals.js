/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME = "LongOS"; // 'cause Bob and I were at a loss for a better name. --I made it better.
const APP_VERSION = "42"; // What did you expect? -- Nice. How about this one? 
const CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const SOFTWARE_INTERRUPT = 2;
const SYSTEM_CALL_PRINT_INT = 3;
const SYSTEM_CALL_PRINT_STRING = 4;
const INVALID_OP_CODE = 5;
const MEMORY_OUT_OF_BOUNDS_EXCEPTION = 6;
const MEMORY_ACCESS_VIOLATION = 7;
const DISPATCHER_RUN_HEAD = 8;
const DISPATCHER_SAVE_PROCESS = 9;
const DISPATCHER_MOVE_PROCESS = 10;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
// Hardware (host)
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory;
var _MemoryAccessor;
// Software (OS)
var _MemoryManager = null;
var _ProcessControlBlock = null; // MAY NEED TO CHANGE
var _PCBManager = null;
var _CPUScheduler = null;
var _CPUDispatcher = null;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _hardwareClockID = null;
// values for dealing with single step mode
let _isSingleStepMode = false;
let _stepReady = false;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
//Memory stuff
let _CurrentMemorySegment;
//Used to keep track of the current quantum and its count
let _Quantum = 6;
let _CurrentQuantumCount = 0;
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
//# sourceMappingURL=globals.js.map