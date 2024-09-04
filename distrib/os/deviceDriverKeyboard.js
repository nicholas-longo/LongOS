/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Mapping of keycodes to characters, including shift-modified characters.
            const keyBoardMap = {
                32: { normal: ' ', shifted: ' ' }, // Space
                48: { normal: '0', shifted: ')' }, // 0
                49: { normal: '1', shifted: '!' }, // 1
                50: { normal: '2', shifted: '@' }, // 2
                51: { normal: '3', shifted: '#' }, // 3
                52: { normal: '4', shifted: '$' }, // 4
                53: { normal: '5', shifted: '%' }, // 5
                54: { normal: '6', shifted: '^' }, // 6
                55: { normal: '7', shifted: '&' }, // 7
                56: { normal: '8', shifted: '*' }, // 8
                57: { normal: '9', shifted: '(' }, // 9
                65: { normal: 'a', shifted: 'A' }, // A
                66: { normal: 'b', shifted: 'B' }, // B
                67: { normal: 'c', shifted: 'C' }, // C
                68: { normal: 'd', shifted: 'D' }, // D
                69: { normal: 'e', shifted: 'E' }, // E
                70: { normal: 'f', shifted: 'F' }, // F
                71: { normal: 'g', shifted: 'G' }, // G
                72: { normal: 'h', shifted: 'H' }, // H
                73: { normal: 'i', shifted: 'I' }, // I
                74: { normal: 'j', shifted: 'J' }, // J
                75: { normal: 'k', shifted: 'K' }, // K
                76: { normal: 'l', shifted: 'L' }, // L
                77: { normal: 'm', shifted: 'M' }, // M
                78: { normal: 'n', shifted: 'N' }, // N
                79: { normal: 'o', shifted: 'O' }, // O
                80: { normal: 'p', shifted: 'P' }, // P
                81: { normal: 'q', shifted: 'Q' }, // Q
                82: { normal: 'r', shifted: 'R' }, // R
                83: { normal: 's', shifted: 'S' }, // S
                84: { normal: 't', shifted: 'T' }, // T
                85: { normal: 'u', shifted: 'U' }, // U
                86: { normal: 'v', shifted: 'V' }, // V
                87: { normal: 'w', shifted: 'W' }, // W
                88: { normal: 'x', shifted: 'X' }, // X
                89: { normal: 'y', shifted: 'Y' }, // Y
                90: { normal: 'z', shifted: 'Z' }, // Z
                188: { normal: ',', shifted: '<' }, // Comma
                190: { normal: '.', shifted: '>' }, // Period
                189: { normal: '-', shifted: '_' }, // Dash
                187: { normal: '=', shifted: '+' }, // Equals
                191: { normal: '/', shifted: '?' }, // Slash
                186: { normal: ';', shifted: ':' }, // Semicolon
                222: { normal: '\'', shifted: '"' }, // Quote
                219: { normal: '[', shifted: '{' }, // Left Bracket
                221: { normal: ']', shifted: '}' }, // Right Bracket
                220: { normal: '\\', shifted: '|' }, // Backslash
                192: { normal: '`', shifted: '~' } // Backtick
            };
            // letters, capital and lower case
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                chr = isShifted ? keyBoardMap[keyCode].shifted : keyBoardMap[keyCode].normal; // if shifted, use the shifted version of that keycode. else, use normal
                _KernelInputQueue.enqueue(chr);
                // digits and shifted clicking digits 
            }
            else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted === true) {
                }
            }
            else if ((keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 188) || // comma
                (keyCode === 190) // period
            ) {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map