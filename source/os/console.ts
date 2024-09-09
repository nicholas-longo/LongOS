/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {
        private commands: string[] = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13", 
                                    "prompt", "date", "whereami", "rickroll", "status", "bsod", "load"];

        private commandHistoryArray: string[]; 
        private currentCommandHistoryIndex: number;

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
                    this.commandHistoryArray = [],
                    this.currentCommandHistoryIndex = -1;
        }


        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    
                    // push the command that was run into the history buffer
                    this.commandHistoryArray.push(this.buffer)
                    
                    this.currentCommandHistoryIndex = -1; // reset the index for history
                    
                    // ... and reset our buffer.
                    this.buffer = "";
                    
                }  
                //ChatGPT 9/4/2024
                // I prompted it to remove the last item of the buffer and keep track of its width so only that character is deleted. 
                else if (chr === String.fromCharCode(8)){ // backspace key
                    // Remove the last character from the buffer if it exists.
                    if (this.buffer.length > 0) {
                        // Remove the last character from the buffer.
                        const lastChar = this.buffer.slice(-1);
                        this.buffer = this.buffer.slice(0, -1);

                        // Measure the width of the last character.
                        const offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);

                        // Move the current X position back by the width of the last character.
                        this.currentXPosition -= offset;

                        // Overwrite the last character with the background color to erase it.
                        this.eraseCharacter(offset);
                    }
                } else if (chr === String.fromCharCode(9)) {
                    this.autoComplete()
            
                } else if (chr === 'up'){ // if it is the up arrow being passed, act a certain way. Hard coded due to an overlap with the & symbol
                    this.commandHistory(true);
                } else if (chr === 'down') {
                    this.commandHistory(false) // if it is the down arrow being pressed, act a certain way. Hard coded due to an overlap with the & symbol
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        
        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                // Go character by character of the given text, drawing one at a time. 
                for(let i = 0; i < text.length; i ++ ){
                    const character = text[i];
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, character);
                    if(this.currentXPosition + offset > _Canvas.width) {
                        // if the newly typed character is going to exceed the width, advance the line
                        this.advanceLine();
                    }
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, character);
                    // Move the current X position. make sure to pass the character and not the whole text
                    // sum up the offsets, if exeeds width, call advance line
                    this.currentXPosition = this.currentXPosition + offset;
                }

            }
         }

        

         // 9/6/2024 Inspired by Josh Seligman's jOSh Hall of Fame Project. Separating the current y position into a function that can be called in order to move the screen correctly. 
        public getLineHeight(): number {
             /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            return  _DefaultFontSize + 
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin;
        }

       // 9/6/24 More inspiration from Josh Seligman's jOSh Hall of Fame Project. Specifically how the current screen is copied and redrawn using getImageData and putImageData
       public advanceLine(): void {
            this.currentXPosition = 0;
            if (this.currentYPosition + this.getLineHeight() > _Canvas.height) {
                // Solution inspired by https://www.w3schools.com/tags/canvas_getimagedata.asp - written by Josh
                const screen = _DrawingContext.getImageData(0, this.getLineHeight(), _Canvas.width, _Canvas.height - this.getLineHeight()); // x pos, y pos, width, height
                
                // clear the current screen
                this.clearScreen();

                // put the new screen on top of it
                _DrawingContext.putImageData(screen, 0, 0);
            }
            else {
                // y not out of space, so do not have to scroll
                this.currentYPosition += this.getLineHeight();
            }
        }

         // Chat GPT 9/4/2024
        // I asked it to handle the logic of erasing only one character. It does this by drawing a new rectangle based on measurements from the last letter. 
        // when the backspace key is pressed, a rectangle that is the color of the background is drawn over the letter that, effectively deleting it. 
        public eraseCharacter(offset: number): void {
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, offset, this.currentFontSize + _FontHeightMargin);
        }

        
        public autoComplete(): void {
            const currentBuffer = this.buffer;
            const options: string[] = [];
            for (let i = 0; i < this.commands.length; i ++) {
                if(this.commands[i].startsWith(currentBuffer)){ // if a command begins with the value of the current buffer (what is on the prompt line)
                    options.push(this.commands[i]);
                }
            }

            // tab will automatically complete the command if it is not ambiguous 
            if (options.length === 1) {
                this.completePrompt(options[0])
            } else if (options.length > 1) {
                this.multipleAutoComplete(options)
            } 

        }

        public completePrompt(command: string): void {
            const endOfCommand = command.substring(this.buffer.length) // create a new string of the letters that were not included in the buffer
            this.putText(endOfCommand);
            this.buffer += endOfCommand; // because the letters get drawn, does not mean the OS will recognize it. In order for commands to work as predicted, the buffer needs to be updated
        }

        public multipleAutoComplete(options: string[]) {
            //get the total width of prompt and current buffer
            const promptWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);
            const bufferWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            const totalWidth = promptWidth + bufferWidth;

            // delete the prompt and buffer
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize, totalWidth, this.currentFontSize + _FontHeightMargin);

            // move the x position 12 pixels in - i think this looks pretty clean for the user
            this.currentXPosition = 12;
            
            for (let i = 0; i < options.length; i ++ ) {
                _StdOut.putText(options[i] + ' ');
            }
            this.advanceLine();
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(_OsShell.promptStr + "" + this.buffer) // adds the symbol that is currently being used for the prompt and the text that was originally on the line before pressing tab
        }

        public commandHistory(isUpArrow: boolean) {
            if (this.commandHistoryArray.length === 0) {
                return;
            }

            // if the current index is not set yet, set it to the most recent command
            if (this.currentCommandHistoryIndex === -1) {
                this.currentCommandHistoryIndex = this.commandHistoryArray.length; 
            }

            //Chat GPT 9/5/24 
            // I asked chat to help me redraw the canvas when I move through the command history. I also asked for it to help me stop redrawing the prompt string every single time I pressed an arrow key
            // clear the current command on the screen
             // clear the entire line (prompt + command)
            _DrawingContext.clearRect(0, this.currentYPosition - this.currentFontSize, _Canvas.width, this.currentFontSize + _FontHeightMargin);
            this.currentXPosition = 0;
            this.putText(_OsShell.promptStr);

            // adjust index depending on the direction (up or down)
            if (isUpArrow) {
                if (this.currentCommandHistoryIndex > 0) {
                    this.currentCommandHistoryIndex--;
                }
            } else {
                if (this.currentCommandHistoryIndex < this.commandHistoryArray.length - 1) {
                    this.currentCommandHistoryIndex++;
                } else {
                    // if we go past the latest command, clear the buffer and return
                    this.buffer = "";
                    this.putText(this.buffer); 
                    return;
                }
            }

            // get the command from history at the updated index
            const command = this.commandHistoryArray[this.currentCommandHistoryIndex];
            this.buffer = command;
            this.putText(this.buffer);

        }

    }
}
