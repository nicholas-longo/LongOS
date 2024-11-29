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
const APP_NAME: string    = "LongOS";   // 'cause Bob and I were at a loss for a better name. --I made it better.
const APP_VERSION: string = "42";   // What did you expect? -- Nice. How about this one? 

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;

const SOFTWARE_INTERRUPT: number = 2; 

const SYSTEM_CALL_PRINT_INT: number = 3; 

const SYSTEM_CALL_PRINT_STRING: number = 4; 

const INVALID_OP_CODE: number = 5; 

const MEMORY_OUT_OF_BOUNDS_EXCEPTION: number = 6;

const MEMORY_ACCESS_VIOLATION: number = 7; 

const DISPATCHER_RUN_HEAD: number = 8;

const DISPATCHER_SAVE_PROCESS: number = 9;

const DISPATCHER_MOVE_PROCESS: number = 10; 

const DISPATCHER_LOAD_REGISTERS_AFTER_TERMINATION: number = 11; 


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//

// Hardware (host)
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory: TSOS.Memory; 
var _MemoryAccessor: TSOS.MemoryAccessor;

// Software (OS)
var _MemoryManager: any =  null; 
var _ProcessControlBlock: any = null; // MAY NEED TO CHANGE
var _PCBManager: any = null; 
var _CPUScheduler: any = null; 
var _CPUDispatcher: any = null; 

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement;          // Initialized in Control.hostInit().
var _DrawingContext: any;                // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;       // Additional space added to font size when advancing a line.

var _Trace: boolean = true;              // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue = null;
var _KernelInputQueue: TSOS.Queue = null; 
var _KernelBuffers = null; 

// Standard input and output
var _StdIn:  TSOS.Console = null; 
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard  = null;
var _krnDiskSystemDeviceDriver: TSOS.DiskSystemDeviceDriver  = null;

var _hardwareClockID: number = null;

// values for dealing with single step mode
let _isSingleStepMode: boolean = false; 
let _stepReady: boolean = false; 

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

//Memory stuff
let _CurrentMemorySegment: number; 

//Used to keep track of the current quantum and its count
let _Quantum: number = 6; 
let _CurrentQuantumCount: number = 0; 

// used to check if the disk is formatted and ready to be used
let _DiskFormatted: boolean = false; 

const NUM_TRACKS = 4; 
const NUM_SECTORS = 8; 
const NUM_BLOCKS = 8; 
// first digit is used for the in use, the next 3 are used to get the next link. The remaining 60 is for our data, which will consist of 2 hex digits each, meaning there will be 120 hex digits in a full block
const BLOCK_SIZE = 64;
const MAX_FILE_NAME_LENGTH = 60; 
const MAX_DATA_SIZE = 60; 

let READ_DATA = "";


var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
