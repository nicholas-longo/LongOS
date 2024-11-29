/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }


        // taken from my Org and Arch Project 
         //formats a number into readable hex with a leading "0x"
         public static hexLog(hexNumber: number, length: number, noPadding?: boolean): string {
            const hexString = hexNumber.toString(16).toUpperCase();
            const hexStringLength = hexString.length;
        
            // pad with 0's if necessary
            if (hexStringLength < length) {
                const zeroCount = length - hexStringLength;
                const paddedHexString = "0".repeat(zeroCount) + hexString;
                return noPadding ? paddedHexString : "0x" + paddedHexString; // if noPadding is true, do not put "0x" in front of the number. this is for some very specific cases and is not always needed. hence the optional param
            } else {
                return noPadding ? hexString : "0x" + hexString;
            }
        }

        // brought over from my Org and Arc ASCII reader
        private static readonly CHAR_TO_BYTE_MAP: { [key: string]: number } = {
            'A': 0x41, 'B': 0x42, 'C': 0x43, 'D': 0x44, 'E': 0x45, 'F': 0x46, 'G': 0x47, 'H': 0x48, 'I': 0x49, 'J': 0x4A,
            'K': 0x4B, 'L': 0x4C, 'M': 0x4D, 'N': 0x4E, 'O': 0x4F, 'P': 0x50, 'Q': 0x51, 'R': 0x52, 'S': 0x53, 'T': 0x54,
            'U': 0x55, 'V': 0x56, 'W': 0x57, 'X': 0x58, 'Y': 0x59, 'Z': 0x5A,
            'a': 0x61, 'b': 0x62, 'c': 0x63, 'd': 0x64, 'e': 0x65, 'f': 0x66, 'g': 0x67, 'h': 0x68, 'i': 0x69, 'j': 0x6A,
            'k': 0x6B, 'l': 0x6C, 'm': 0x6D, 'n': 0x6E, 'o': 0x6F, 'p': 0x70, 'q': 0x71, 'r': 0x72, 's': 0x73, 't': 0x74,
            'u': 0x75, 'v': 0x76, 'w': 0x77, 'x': 0x78, 'y': 0x79, 'z': 0x7A,
            '0': 0x30, '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34, '5': 0x35, '6': 0x36, '7': 0x37, '8': 0x38, '9': 0x39,
            ' ': 0x20, '.': 0x2E, '-': 0x2D, '!': 0x21, '@': 0x40, '#': 0x23, '$': 0x24, '%': 0x25, '^': 0x5E, '&': 0x26,
            '*': 0x2A, '(': 0x28, ')': 0x29, ':': 0x3A, ';': 0x3B, '\'': 0x27, '"': 0x22, '<': 0x3C, '>': 0x3E, '?': 0x3F,
            '/': 0x2F, '\n': 0x0A, '\r': 0x0D
        };
    
        private static readonly BYTE_TO_CHAR_MAP: { [key: number]: string } = {
            0x41: 'A', 0x42: 'B', 0x43: 'C', 0x44: 'D', 0x45: 'E', 0x46: 'F', 0x47: 'G', 0x48: 'H', 0x49: 'I', 0x4A: 'J',
            0x4B: 'K', 0x4C: 'L', 0x4D: 'M', 0x4E: 'N', 0x4F: 'O', 0x50: 'P', 0x51: 'Q', 0x52: 'R', 0x53: 'S', 0x54: 'T',
            0x55: 'U', 0x56: 'V', 0x57: 'W', 0x58: 'X', 0x59: 'Y', 0x5A: 'Z',
            0x61: 'a', 0x62: 'b', 0x63: 'c', 0x64: 'd', 0x65: 'e', 0x66: 'f', 0x67: 'g', 0x68: 'h', 0x69: 'i', 0x6A: 'j',
            0x6B: 'k', 0x6C: 'l', 0x6D: 'm', 0x6E: 'n', 0x6F: 'o', 0x70: 'p', 0x71: 'q', 0x72: 'r', 0x73: 's', 0x74: 't',
            0x75: 'u', 0x76: 'v', 0x77: 'w', 0x78: 'x', 0x79: 'y', 0x7A: 'z',
            0x30: '0', 0x31: '1', 0x32: '2', 0x33: '3', 0x34: '4', 0x35: '5', 0x36: '6', 0x37: '7', 0x38: '8', 0x39: '9',
            0x20: ' ', 0x2E: '.', 0x2D: '-', 0x21: '!', 0x40: '@', 0x23: '#', 0x24: '$', 0x25: '%', 0x5E: '^', 0x26: '&',
            0x2A: '*', 0x28: '(', 0x29: ')', 0x3A: ':', 0x3B: ';', 0x27: '\'', 0x22: '"', 0x3C: '<', 0x3E: '>', 0x3F: '?',
            0x2F: '/', 0x0A: '\n', 0x0D: '\r'
        };
    
        static byteToChar(byteValue: number): string {
            return Utils.BYTE_TO_CHAR_MAP[byteValue];
        }
    
        static charToByte(charValue: string): number {
            return Utils.CHAR_TO_BYTE_MAP[charValue];
        }

        static charactersToHexString(characters: string): string {
            let hexString = "";
            let hex = 0; 
            for (let i = 0; i < characters.length; i ++) {
                hex = Utils.charToByte(characters[i]);
                hexString += Utils.hexLog(hex, 0, true); // take the hex character from the string, pass it into hex log which will turn it into a string. no added 0's in front of it and no padding
            }
            return hexString; 
        }

        static hexStringToCharacters(hexString: string): string {
            let character = "";
            let characters = "";
            for(let i = 0; i < hexString.length - 1; i +=2) {
                character = Utils.byteToChar(parseInt(hexString.substring(i, i + 2), 16)); // parse each two number string as hex
                characters += character;
            }
            return characters;
        }
    }
}
