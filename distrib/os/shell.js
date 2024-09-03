/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        constructor() {
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date 
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Says where you are.");
            this.commandList[this.commandList.length] = sc;
            // rickroll
            sc = new TSOS.ShellCommand(this.shellRickRoll, "rickroll", "- Lol");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the status");
            this.commandList[this.commandList.length] = sc;
            //bsod 
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- This tests the BSOD functionality");
            this.commandList[this.commandList.length] = sc;
            //load 
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Ensures that all code in User Program Input is valid.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //update the date in the display bar every second
            //Assistance From Chat GPT 9/3/2024
            // Me: "Where can I put an interval in the shell.ts file so the time updates each second"
            // Chat: "Modify the init() Method to Start Updating the Date Periodically: Inside the init() method of the Shell class, call updateDateInStatusBar() and set up an interval to call it regularly:"
            this.updateDate();
            setInterval(this.updateDate, 1000);
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length == 1) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver will display what version LongOS is currently running.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown will shut down LongOS, but not the hardware");
                        _StdOut.advanceLine();
                        _StdOut.putText("that it runs on. Why would you want to shut it off?");
                        break;
                    case "cls":
                        _StdOut.putText("Cls stands for clear screen and it will clear the screen. ");
                        _StdOut.advanceLine();
                        _StdOut.putText(" It also resets the cursor position to the top left.");
                        break;
                    case "man":
                        _StdOut.putText("Wait! That is this one.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Man gives a better description of commands.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns on and off the infromation about the OS.");
                        _StdOut.advanceLine();
                        _StdOut.putText("I know, it gets annoying.");
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on a string. It acts as a cipher.");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt. Good for if you get bored of looking at >");
                        break;
                    case "date":
                        _StdOut.putText("Shows the date and time. Why are you asking me this?");
                        break;
                    case "whereami":
                        _StdOut.putText("Stop being weird, you know where you are...");
                        _StdOut.advanceLine();
                        _StdOut.putText("and what you have done.");
                        break;
                    case "rickroll":
                        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
                        _StdOut.putText("There is no escape.");
                        break;
                    case "status":
                        _StdOut.putText("Change the status bar. Make it something cool!");
                        break;
                    case "bsod":
                        _StdOut.putText("This will literally crash your OS. Be warned..");
                        break;
                    case "load":
                        _StdOut.putText("Makes sure no funny business is loaded");
                        _StdOut.advanceLine();
                        _StdOut.putText("into User Program Input");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else if (args.length > 1) {
                _StdOut.putText("Usage: man <topic>  Please supply only one topic at a time.");
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate() {
            const currentDate = new Date();
            const dateAsString = currentDate.toLocaleDateString();
            const timeAsString = currentDate.toLocaleTimeString();
            _StdOut.putText(dateAsString + " " + timeAsString);
        }
        shellWhereAmI() {
            _StdOut.putText("You are in front of a computer screen.");
        }
        // opens up a new tab and plays a cool video
        shellRickRoll() {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        }
        shellStatus(args) {
            if (args.length > 0) {
                const statusMessage = args.join(" ");
                const statusBar = document.getElementById("divStatusBarMessage");
                if (statusBar) { // make sure it runs after the DOM is fully loaded
                    statusBar.innerText = statusMessage;
                }
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }
        updateDate() {
            const dateValue = document.getElementById("divStatusBarDate");
            if (dateValue) {
                const currentDate = new Date();
                const dateAsString = currentDate.toLocaleDateString();
                const timeAsString = currentDate.toLocaleTimeString();
                dateValue.innerText = `${dateAsString} ${timeAsString}`;
            }
        }
        shellBSOD() {
            const display = _DrawingContext;
            display.fillStyle = "blue";
            display.fillRect(0, 0, 500, 500); // hard coded width and height from canvas in index
            display.fillStyle = "white";
            display.fillText("It's so over.. you are gonna have to restart this.", 125, 250);
            _Kernel.krnShutdown(); // shutdown the OS if a BSOD is called
        }
        shellLoad() {
            const textBox = document.getElementById("taProgramInput"); // ChatGPT 9/3/2024. I asked why the textBox.value was not working, it said to make it into this data type
            const userProgramInput = textBox.value;
            // needs to be A-F, 0-9
            // whitespace is allowed 
            // have an even amount of characters 
            //then format and update the textbox 
            // ChatGPT 9/3. 
            // I prompted it to help generate the code to format the text in the text area on the following principles: 
            // 1. Eliminate whitespace between pairs
            // 2. Numbers and Letters can start the pair
            //Format the textarea if it is valid
            const formattedText = userProgramInput
                .split(/\s+/) // Split by any whitespace characters
                .filter(Boolean) // Remove empty strings from the array
                .join('') // Join without spaces to get the combined characters
                .match(/([A-Za-z]\d|\d[A-Za-z])/g) // Match both letter-number and number-letter pairs
                ?.join(' ') || ''; // Join matched pairs with a space between them
            textBox.innerText = formattedText;
            _StdOut.putText(formattedText);
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map