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
            //run 
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<PID> - runs the code for the specified process ID.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.clearmem, "clearmem", "- Clear all memory segments");
            this.commandList[this.commandList.length] = sc;
            // runall 
            sc = new TSOS.ShellCommand(this.runall, "runall", "- execute all programs at once");
            this.commandList[this.commandList.length] = sc;
            // ps 
            sc = new TSOS.ShellCommand(this.ps, "ps", "- display the PID and state of all processes");
            this.commandList[this.commandList.length] = sc;
            // kill 
            sc = new TSOS.ShellCommand(this.kill, "kill", "- <PID> kills the specified process");
            this.commandList[this.commandList.length] = sc;
            // killall 
            sc = new TSOS.ShellCommand(this.killall, "killall", "- kill all processes");
            this.commandList[this.commandList.length] = sc;
            // kill 
            sc = new TSOS.ShellCommand(this.quantum, "quantum", "<int> - let the user set the Round Robin quantum (measured in cpu cycles)");
            this.commandList[this.commandList.length] = sc;
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
            // // 2. Lower-case it.
            // buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            tempList[0] = tempList[0].toLowerCase(); // make only the command lower case, keep the arguments as the case they are provided
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
                        _StdOut.putText("Shutdown will shut down LongOS, but not the hardware that it runs on. Why would you want to shut it off?");
                        break;
                    case "cls":
                        _StdOut.putText("Cls stands for clear screen and it will clear the screen. It also resets the cursor position to the top left.");
                        break;
                    case "man":
                        _StdOut.putText("Wait! That is this one. Man gives a better description of commands.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns on and off the infromation about the OS. I know, it gets annoying.");
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
                        _StdOut.putText("Stop being weird, you know where you are... and what you have done.");
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
                        _StdOut.putText("Makes sure no funny business is loaded into User Program Input");
                        break;
                    case "run":
                        _StdOut.putText("This will run the program stored in memory according to the given PID. You may use this one quite a bit.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears the memory. It is gone - trust me");
                        break;
                    case "runall":
                        _StdOut.putText("RUN EVERYTHING AND I MEAN EVERYTHING");
                        break;
                    case "ps":
                        _StdOut.putText("Displays a process and other useful fun stuff");
                        break;
                    case "kill":
                        _StdOut.putText("Dont like a program. Kill it. But you can't bring it back to life, there is no alive command.");
                        break;
                    case "killall":
                        _StdOut.putText("You are drunk with power. Please come back to your senses.");
                        break;
                    case "quantum":
                        _StdOut.putText("Fancy computer stuff idk im not smart enough for all that");
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
            _Kernel.krnTrapError('bsod test');
        }
        shellLoad() {
            const textBox = document.getElementById("taProgramInput"); // ChatGPT 9/3/2024. I asked why the textBox.value was not working, it said to make it into this data type
            const userProgramInput = textBox.value;
            const userProgramInputWithoutSpaces = userProgramInput.replace(/\s+/g, ''); // used to make sure spaces are not counted when calculating program size
            if (userProgramInput.trim() === '') {
                _StdOut.putText("Invalid Program: User Program Input is Empty");
                return;
            }
            if (userProgramInputWithoutSpaces.length > 512) {
                _StdOut.putText("Invalid Program: User Program Exceeds 256 Bytes");
                return;
            }
            //ChatGPT 9/3. 
            // I asked for regex condition where A-F, a-f, 0-9, and whitespace is acceptable
            const isValidInput = /^[A-Fa-f0-9\s]*$/.test(userProgramInput);
            if (!isValidInput) {
                _StdOut.putText("Invalid Program: Input must be A-F, 0-9, or whitespace");
                return;
            }
            // make sure there are an even amount of non whitespace characters
            const hasEvenNumberOfCharacters = userProgramInput.replace(/\s+/g, ''); // replaces whitespace with empty string
            // if amount of characters is odd
            if (hasEvenNumberOfCharacters.length % 2 == 1) {
                _StdOut.putText("Invalid Program: Number of characters must be even");
                return;
            }
            // ChatGPT 9/3. 
            // I prompted it to help generate the code to format the text in the text area on the following principles: 
            // 1. Eliminate whitespace between pairs
            // 2. Numbers and Letters can start the pair
            // 3. Numbers can be paired with numbers, letters can be paired with letters
            // 4. Turn Lower Case into Upper
            //Format the textarea if it is valid
            const formattedText = userProgramInput
                .split(/\s+/) // Split by any whitespace characters
                .filter(Boolean) // Remove empty strings from the array
                .join('') // Join without spaces to get the combined characters
                .toUpperCase() // Convert all characters to uppercase
                .match(/([A-Z]{2}|\d{2}|[A-Z]\d|\d[A-Z])/g) // Match two letters, two numbers, or letter-number pairs
                ?.join(' ') || ''; // Join matched pairs with a space between them
            textBox.value = formattedText;
            // make each op code into a list
            const hexStringArray = textBox.value.split(" ");
            let program = [];
            for (let i = 0; i < hexStringArray.length; i++) {
                let value = parseInt(hexStringArray[i], 16); // convert the string hex into a number and push to the temporary memory array
                program.push(value);
            }
            // use the memory manager to make sure space is not filled up
            if (!_MemoryManager.isSpaceAvailable()) {
                _StdOut.putText("Failed to Load: No memory available");
                return;
            }
            const currentSegment = _CurrentMemorySegment;
            // load the program into memory
            _MemoryAccessor.flashMemory(program, currentSegment);
            // create the pcb using the manager, set the status, and update the table
            const pcbEntry = _PCBManager.createPCB(8); // pass the priority of 8 as default for a program
            pcbEntry.updateSegmentBaseAndLimit(currentSegment);
            pcbEntry.updatePCBTable();
            //show the process id and priority
            _StdOut.putText(`Process ID: ${pcbEntry.PID} Priority: ${pcbEntry.priority}`);
        }
        // shell run 
        // terminate the existing pcb
        // prompt the cpu to begin its work
        // will have to change the status of the pcb block a few times, but I will add the logic for that a bit later because that is for project 3
        shellRun(args) {
            if (args.length <= 0) { // make sure there is a PID given
                _StdOut.putText("Usage: run <PID>  Please supply a PID.");
                return;
            }
            console.log(args[0]);
            const PID = parseInt(args[0]); // get the user inputted PID
            const pcb = _PCBManager.findPCB(PID); // get the current pcb
            if (!pcb) { // makes sure the pid provided is valid
                _StdOut.putText(`The PID: ${PID} is not valid.`);
                return;
            }
            const status = pcb.Status;
            switch (status) {
                case ("Resident"):
                    _PCBManager.updatePCBStatus(PID, "Ready"); // change pcb status. this also puts it into the ready queue because the updatePCBStatus will do that if the status is "Ready"
                    break;
                case ("Ready"):
                case ("Running"):
                    _StdOut.putText("Cannot run program, already running.");
                    break;
                case ("Terminated"):
                    _StdOut.putText(`Process ID: ${PID} is already terminated.`);
                    break;
            }
        }
        clearmem() {
            _Kernel.clearMemory();
        }
        // sets all of the processes in the pcbQueue to ready, and populates the ready queue
        runall() {
            const pcbQueue = _PCBManager.getPCBs();
            for (let i = 0; i < pcbQueue.length; i++) {
                const PIDAsString = pcbQueue[i].PID.toString();
                _OsShell.shellRun([PIDAsString]);
            }
        }
        ps() {
            const pcbTable = document.getElementById("pcbTable");
            if (pcbTable.rows.length <= 1) { // the column headers is the first row
                _StdOut.putText("No processes available.");
                return;
            }
            for (let i = 1; i < pcbTable.rows.length; i++) {
                const row = pcbTable.rows[i];
                const pid = row.cells[0].innerHTML; // PID is in the first cell
                const status = row.cells[11].innerHTML; // status is in the last cell 
                _StdOut.putText(`PID: ${pid}, Status: ${status}`);
                _StdOut.advanceLine();
            }
        }
        kill(args) {
            if (args.length <= 0) { // make sure there is a PID given
                _StdOut.putText("Usage: run <PID>  Please supply a PID.");
                return;
            }
            const PID = parseInt(args[0]); // get the user inputted PID
            const pcb = _PCBManager.findPCB(PID); // get the current pcb
            if (!pcb) { // makes sure the pid provided is valid
                _StdOut.putText(`The PID: ${PID} is not valid.`);
                return;
            }
            const status = pcb.Status;
            switch (status) {
                case ("Resident"):
                    _StdOut.putText("Cannot kill Process with Process ID: ${PID}, it is not running.");
                    break;
                // only kill a process if it is ready or running
                case ("Ready"):
                case ("Running"):
                    _StdOut.putText(`Killing Process with Process ID: ${PID}`);
                    _Kernel.krnTerminateProcess(PID);
                    break;
                case ("Terminated"):
                    _StdOut.putText(`Process ID: ${PID} is already terminated.`);
                    break;
            }
        }
        killall() {
        }
        quantum(args) {
            if (args.length <= 0) {
                _StdOut.putText("Usage: quantum <int> Please supply an int.");
                return;
            }
            const quantum = parseInt(args[0]);
            if (quantum <= 0) {
                _StdOut.putText("Quantum cannot be 0 or negative. Please supply a different value.");
                return;
            }
            _CPUScheduler.setQuantum(quantum);
            _StdOut.putText(`Quantum value set to ${quantum}.`);
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map