import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import ansiEscapes from "ansi-escapes";
import c from "ansi-colors";
import {
  clearCommand,
  helpCommand,
  echoCommand,
  loginCommand,
  logoutCommand,
  manCommand,
  registerCommand as registrationCommand,
  sudoCommand,
  bookingCommand,
  flightCommand,
} from "./commands";

/**
 * Object schema for registering a new command.
 * command: The keyword to listen on terminal input
 * description: A short description printed by the `help`command
 * callback: The function to process the user input.
 */
export interface ICommand {
  command: string;
  description: string;
  hidden?: boolean;
  usage?: string[];
  callback: (terminalMgr: TerminalManager, ...args: string[]) => Promise<string | void>;
}

/**
 * Main class for handling all xterm terminal related tasks.
 */
export class TerminalManager {
  private static _instance: TerminalManager;
  private terminal: Terminal;
  private currentCommand = "";
  private prompt = "$ ";
  /** The number of chars in the last line of the prompt */
  private pLength = 2;
  private registeredCommands: ICommand[] = [];
  private commandHistory: string[] = [];
  private commandHistoryPosition = 0;
  /** If the terminal has been initialized already */
  private isOpen = false;
  /** Position of cursor in current command */
  private tPosition = 0;
  /** Locks terminal during command execution */
  private isLocked = false;
  /** Buffer for multi-line commands */
  private commandBuffer = "";
  /** Promise resolve function for transmitting user input during cmd run */
  private resolveUserQuery: ((value: string | PromiseLike<string>) => void) | undefined;

  /**
   * Contructs the main terminal object (singleton contructor)
   */
  private constructor() {
    this.terminal = new Terminal({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      fontSize: 16,
      cursorBlink: true,
      theme: {
        foreground: "#F8F8F8",
        background: "#2D2E2C",
        selection: "#5DA5D533",
        black: "#1E1E1D",
        brightBlack: "#262625",
        red: "#CE5C5C",
        brightRed: "#FF7272",
        green: "#5BCC5B",
        brightGreen: "#72FF72",
        yellow: "#CCCC5B",
        brightYellow: "#FFFF72",
        blue: "#5D5DD3",
        brightBlue: "#7279FF",
        magenta: "#BC5ED1",
        brightMagenta: "#E572FF",
        cyan: "#5DA5D5",
        brightCyan: "#72F0FF",
        white: "#F8F8F8",
        brightWhite: "#FFFFFF",
      },
    });
  }

  /**
   * Getter
   * @static
   * @returns The single TerminalManager instance
   */
  public static get Instance(): TerminalManager {
    return this._instance || (this._instance = new this());
  }

  /**
   * Prints a newline, followed by a $ prompt.
   */
  private printPrompt(): void {
    this.currentCommand = "";
    this.terminal.write("\r\n" + this.prompt);
  }

  /**
   * Setter
   * @param prompt The new prompt to use. Can include newlines
   */
  public set Prompt(prompt: string) {
    this.prompt = prompt;
    // Update length of prompt (last line)
    const index = prompt.lastIndexOf("\n");
    if (index === -1) this.pLength = prompt.length;
    else this.pLength = prompt.length - index;
  }

  /**
   * Getter
   * @returns All registered commands
   */
  public get Commands(): ICommand[] {
    return this.registeredCommands;
  }

  /**
   * Getter
   * @returns The current column width of the terminal
   */
  public get Cols(): number {
    return this.terminal.cols;
  }

  /**
   * Registers a new command to the terminal.
   * @param newCommand The command to register
   * @returns True if the command is registered successfully
   * @private
   */
  private registerCommand(newCommand: ICommand): boolean {
    const existingCommand = this.registeredCommands.filter((cmd) => cmd.command === newCommand.command);
    if (existingCommand.length > 0) {
      this.writeError(`Failed to register "${newCommand.command}": command already exists!`, true);
      return false;
    }
    this.registeredCommands.push(newCommand);
    // Sort commands alphabetically for printing with `help`
    this.registeredCommands.sort((a, b) => a.command.localeCompare(b.command));
    return true;
  }

  /**
   * Initializes the terminal on first load.
   *
   * Resizes the window, registers event handlers & basic commands
   * and prints the welcome message.
   */
  private initializeTerminal(): void {
    // Resize terminal to fit the parent element
    const fitAddon = new FitAddon();
    this.terminal.loadAddon(fitAddon);
    fitAddon.fit();
    // Fit terminal on window resize
    window.onresize = () => { fitAddon.fit(); };
    // Add raw keyboard event handler
    this.terminal.attachCustomKeyEventHandler(this.inputPreProcessing.bind(this));
    // Add key / paste event handler
    this.terminal.onData(this.inputProcessing.bind(this));
    // Print welcome message
    this.terminal.writeln(`Welcome to the ${c.blue.bold("Secure Booking Service")}!`);
    this.terminal.writeln(`Type ${c.yellow.bold("help")} for a list of available commands.`);
    this.printPrompt();
    // Register basic commands
    this.registerCommand(helpCommand);
    this.registerCommand(manCommand);
    this.registerCommand(clearCommand);

    // Register commands
    this.registerCommand(loginCommand);
    this.registerCommand(logoutCommand);
    this.registerCommand(registrationCommand);
    this.registerCommand(echoCommand);
    this.registerCommand(bookingCommand);
    this.registerCommand(sudoCommand);
    this.registerCommand(flightCommand);
  }

  /**
   * Searches and executes the command entered at the terminal.
   */
  private runCommand(): void {
    // Seperate command and arguments
    const [keyword, ...args] = this.currentCommand.trim().split(" ").filter(i => i !== "");
    if (keyword?.length > 0) {
      this.commandHistory.push(this.currentCommand);
      this.terminal.writeln(""); // Newline for command output
      const foundCommand = this.registeredCommands.filter((cmd) => cmd.command === keyword);
      if (foundCommand.length === 1) {
        // Lock terminal during command execution
        this.isLocked = true;

        // Call command action
        const execution = foundCommand[0].callback(this, ...args);
        execution.then((answer) => this.terminal.write(answer || ""));

        // Unlock terminal and print prompt
        execution.finally(() => {
          this.isLocked = false;
          this.postCommandProcessing();
        });
      } else {
        this.writeError(`${keyword}: command not found`);
        this.postCommandProcessing();
      }
    } else {
      // Nothing (or whitespace only) entered
      this.postCommandProcessing();
    }
  }

  /**
   * Cleanup and variable reset after a command run.
   */
  private postCommandProcessing(): void {
    // Print a new prompt after each command run (enter key)
    this.printPrompt();
    // Update current command history position
    this.commandHistoryPosition = this.commandHistory.length;
    // Reset input and cursor variables
    this.currentCommand = "";
    this.tPosition = 0;
    // Continue processing if multi-line command entered
    if (this.commandBuffer !== "") {
      this.inputProcessing(this.commandBuffer);
    }
  }

  /**
   * Moves the terminal cursor left or right.
   * @param count Negative (left) or positive (right) move count
   */
  private moveCursor(count: number): void {
    if (count > 0) {
      // Do not move right if already at the end of the command
      if (this.tPosition === this.currentCommand.length) return;

      // Do not move right beyond the end of the current command
      if (this.tPosition + count > this.currentCommand.length) {
        count = this.currentCommand.length - this.tPosition;
      }
    }
    else if (count < 0) {
      // Do not move left if already at the prompt
      if (this.tPosition === 0) return;

      // Do not move left beyond the prompt
      if (this.tPosition + count < 0) count = -this.tPosition;
    } else return; // Zero move

    // Move cusor and calculate potential line jumps
    const currRow = Math.floor((this.tPosition + this.pLength) / this.terminal.cols);
    const destRow = Math.floor((this.tPosition + count + this.pLength) / this.terminal.cols);
    const currColumn = (this.tPosition + this.pLength) % this.terminal.cols;
    const destColumn =
      (this.tPosition + count + this.pLength) % this.terminal.cols;
    this.write(ansiEscapes.cursorMove(destColumn - currColumn, destRow - currRow));
    this.tPosition += count;
  }

  /**
   * Loads a command from the command history.
   * @param direction The arrow key pressed
   */
  private loadHistoryCommand(direction: number): void {
    // Get the previous / next command if exists
    const cmd = this.commandHistory[this.commandHistoryPosition + direction];
    if (cmd === undefined) return;
    // Apply history position change
    this.commandHistoryPosition += direction;
    // Clear all characters from the current terminal line
    this.moveCursor(-this.tPosition);
    this.write(ansiEscapes.cursorSavePosition);
    this.write(" ".repeat(this.currentCommand.length));
    this.write(ansiEscapes.cursorRestorePosition);
    // Write history command
    this.write(cmd);
    this.tPosition = cmd.length;
    this.currentCommand = cmd;
  }

  /**
   * Waits for the user to press a key.
   * Does *not* work with the 'Enter' key.
   * @param question The user question for the answer options, eg. 'Continue?'
   * @param expectedInput Array of valid input chars, defaults to ['y', 'n']
   * @returns A promise for the first key entered by the user
   */
  public async runUserQuery(question: string, expectedInput: Array<string> = ['y', 'n']): Promise<string> {
    // Write question
    this.writeLine(`${question} (${expectedInput.join("/")})`)
    // Create promise and activate query
    let answer: string = await new Promise(resolve => this.resolveUserQuery = resolve);
    // Check user input
    while (!expectedInput.includes(answer)) {
      this.write("Illegal input:    ");
      this.writeError(answer);
      this.write("Accepted inputs:  ");
      this.writeInfo(expectedInput.join("/"));
      // Create new promise
      answer = await new Promise(resolve => this.resolveUserQuery = resolve);
    }
    // Deactivate query and return answer
    this.resolveUserQuery = undefined;
    return Promise.resolve(answer);
  }

  /**
   * Handles raw keyboard events entered in the terminal.
   * @param event The keyboard event triggered
   * @returns True if the event should be further processed internally by xterm
   */
  private inputPreProcessing(event: KeyboardEvent): boolean {
    // Check if user query is running
    if (this.resolveUserQuery !== undefined && event.key !== "Enter" && event.type === "keyup") {
      this.resolveUserQuery(event.key);
      return false;
    }
    // Block input while command is running
    if (this.isLocked) return false;

    // Prevent terminal handling of ctrl + v
    if (event.code === "KeyV" && event.ctrlKey) {
      return false;
    }

    switch (event.key) {
      case "ArrowLeft":
        // Allow press and hold (ignore release)
        if (event.type !== "keyup")
          this.moveCursor(-1);
        return false;
      case "ArrowRight":
        // Allow press and hold (ignore release)
        if (event.type !== "keyup")
          this.moveCursor(+1);
        return false;
      case "ArrowUp":
        // Do not allow press and hold (ignore press)
        if (event.type !== "keydown")
          this.loadHistoryCommand(-1);
        return false;
      case "ArrowDown":
        // Do not allow press and hold (ignore press)
        if (event.type !== "keydown")
          this.loadHistoryCommand(+1);
        return false;
      default:
        // Continue processing input
        return true;
    }
  }

  /**
   * Handles all characters entered in the terminal.
   * @param text A single entered character or pasted string
   */
  private inputProcessing(text: string): void {
    // Block input while command is running
    if (this.isLocked) return;

    switch (text) {
      case "\u0003": // Ctrl+C
        // Move cursor to the end of the command
        this.moveCursor(this.currentCommand.length - this.tPosition);
        this.terminal.write("^C");
        this.printPrompt();
        break;
      case "\r": // Enter
        // Move cursor to the end of the command
        this.moveCursor(this.currentCommand.length - this.tPosition);
        this.runCommand();
        break;
      case "\u007F": // Backspace (DEL)
        // Do not delete the prompt
        if (this.tPosition > 0) {
          // Cut char at cursor position
          const first = this.currentCommand.slice(0, this.tPosition - 1);
          const last = this.currentCommand.slice(this.tPosition);
          this.currentCommand = first + last;
          // Move cursor one char to the left, save cursor position,
          // write remaining string again,
          // overwrite old last char with a space and then move the cursor
          // back to the cut position
          this.moveCursor(-1);
          this.terminal.write(ansiEscapes.cursorSavePosition);
          this.terminal.write(last + " ");
          this.terminal.write(ansiEscapes.cursorRestorePosition);
        }
        break;
      default: 
        this.writeUserInput(text);
    }
  }

  /**
   * Writes a given *user input* to the terminal output.
   * 
   * @param text The text to write
   */
  private writeUserInput(text: string): void {
    if (text.length > 1) {
      // Remove beginning or trailing whitespace
      text = text.trim()
    }
    // Check for multi-line commands
    if (/\r\n|\r|\n/.test(text)) {
      const [firstLine, /**newlineChar*/, otherLines] = text.split(/(\r\n|\r|\n)([\s\S]*)/);
      this.commandBuffer = otherLines;
      text = firstLine;
    } else {
      // No multi-line or last line of multi-line cmd
      this.commandBuffer = "";
    }
    // Filter non printable characters
    text = Array.from(text).filter(char => {
      return (char >= String.fromCharCode(0x20) && char <= String.fromCharCode(0x7d)) || char >= "\u00a0";
    }).join("")
    // Insert char / text at cursor position
    const first = this.currentCommand.slice(0, this.tPosition);
    const last = this.currentCommand.slice(this.tPosition);
    this.currentCommand = first + text + last;
    // Overwrite old contents with the inserted char / text,
    // followed by the remaining part and then move the cursor
    // back to the insert position;
    if (last.length > 0) {
      this.terminal.write(ansiEscapes.cursorSavePosition);
      this.terminal.write(text + last);
      this.terminal.write(ansiEscapes.cursorRestorePosition);
      this.moveCursor(text.length);
    } else {
      this.terminal.write(text);
      this.tPosition += text.length;
    }
    // Run current line if multi-line command
    if (this.commandBuffer !== "") {
      this.inputProcessing("\r");
    }
  }

  /**
   * Opens and initializes the terminal.
   * @param parent The parent element to create the terminal in
   */
  public openTerminal(parent: HTMLElement | null): void {
    this.terminal.open(parent || document.createElement("div"));
    if (!this.isOpen) {
      // Only initialize the terminal once
      this.initializeTerminal();
    }
    this.isOpen = true;
  }

  /**
   * Prints a error message to terminal
   * The message will be red except the icon is printed
   *
   * @param {string} error Error message
   * @param {boolean} [icon=false] Print ✖ icon
   * @memberof TerminalManager
   */
  public writeError(error: string, icon = false): void {
    const style = c.red.bold;
    if (icon) {
      this.terminal.writeln(style("✖") + " " + error)
    } else {
      this.terminal.writeln(style(error));
    }
  }

  /**
   * Prints a warning message to terminal
   * The message will be yellow except the icon is printed
   *
   * @param {string} warning Warning message
   * @param {boolean} [icon=false] Print ⚠ icon
   * @memberof TerminalManager
   */
  public writeWarning(warning: string, icon = false): void {
    const style = c.yellow.bold;
    if (icon) {
      this.terminal.writeln(style("⚠") + " " + warning)
    } else {
      this.terminal.writeln(style(warning));
    }
  }

  /**
   * Prints a success message to terminal
   * The message will be green except the icon is printed
   *
   * @param {string} success success message
   * @param {boolean} [icon=false] Print ℹ icon
   * @memberof TerminalManager
   */
  public writeSuccess(success: string, icon = false): void {
    const style = c.green.bold;
    if (icon) {
      this.terminal.writeln(style("✔") + " " + success)
    } else {
      this.terminal.writeln(style(success));
    }
  }

  /**
   * Prints a info message to terminal
   * The message will be blue except the icon is printed
   *
   * @param {string} info info message
   * @param {boolean} [icon=false] Print ℹ icon
   * @memberof TerminalManager
   */
  public writeInfo(info: string, icon = false): void {
    const style = c.blueBright.bold;
    if (icon) {
      this.terminal.writeln(style("ℹ") + " " + info)
    } else {
      this.terminal.writeln(style(info));
    }
  }

  /**
   * Writes the given text to the terminal followed by a newline character.
   * @param line The characters to write
   */
  public writeLine(line = ""): void {
    this.terminal.writeln(line);
  }

  /**
   * Writes the given text to the terminal.
   * @param text The characters to write
   */
  public write(text: string): void {
    this.terminal.write(text);
  }

  /**
   * Clears the terminal
   */
  public clear(): void {
    this.terminal.write(ansiEscapes.clearTerminal);
  }
}
