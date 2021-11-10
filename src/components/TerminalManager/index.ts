import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import ansiEscapes from 'ansi-escapes';
import {
  clearCommand,
  echoCommand,
  loginCommand,
  logoutCommand,
  manCommand,
  registerCommand as registrationCommand,
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
  callback: (
    terminalMgr: TerminalManager,
    ...args: string[]
  ) => Promise<string | void>;
}

/**
 * Main class for handling all xterm terminal related tasks.
 */
export class TerminalManager {
  private static _instance: TerminalManager;
  private terminal: Terminal;
  private currentCommand = "";
  private registeredCommands: ICommand[] = [];
  private commandHistory: string[] = [];
  private commandHistoryPosition = 0;
  private isOpen = false;
  private tColumns = 0; // Columns of the terminal
  private tPosition = 0; // Position of cursor in current command
  private isLocked = false;

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
    this.terminal.write("\r\n$ ");
    //TODO: Add dynamic padding based on prompt (dynamic prompt)
  }

  /**
   * Registers a new command to the terminal.
   * @param newCommand The command to register
   * @returns True if the command is registered successfully
   * @private
   */
  private registerCommand(newCommand: ICommand): boolean {
    const existingCommand = this.registeredCommands.filter(
      (cmd) => cmd.command === newCommand.command
    );
    if (existingCommand.length > 0) {
      this.writeError(
        `Failed to register "${newCommand.command}": command already exists!`,
        true
      );
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
    this.tColumns = this.terminal.cols;
    // Add raw keyboard event handler
    this.terminal.attachCustomKeyEventHandler(
      this.inputPreProcessing.bind(this)
    );
    // Add key / paste event handler
    this.terminal.onData(this.inputProcessing.bind(this));
    // Print welcome message
    this.terminal.writeln("Welcome to the Secure Booking Service!");
    this.terminal.writeln("Type `help` for a list of available commands.");
    this.printPrompt();
    // Register basic commands
    this.registerCommand({
      command: "help",
      description: "Prints this help message.",
      callback: async (terminalMgr) => {
        terminalMgr.writeLine("All available commands:\r\n");
        const width =
          this.registeredCommands.reduce((longest, cmd) => {
            return longest.command.length >= cmd.command.length ? longest : cmd;
          }).command.length + 4;
        for (const cmd of this.registeredCommands) {
          terminalMgr.writeLine(
            cmd.command +
              " ".repeat(width - cmd.command.length) +
              cmd.description
          );
        }
      },
    });
    this.registerCommand(manCommand);
    this.registerCommand(clearCommand);

    // Register commands
    this.registerCommand(loginCommand);
    this.registerCommand(logoutCommand);
    this.registerCommand(registrationCommand);
    this.registerCommand(echoCommand);
  }

  /**
   * Searches and executes the command entered at the terminal.
   */
  private runCommand(): void {
    // Seperate command and arguments
    const [keyword, ...args] = this.currentCommand.trim().split(" ");
    if (keyword.length > 0) {
      this.commandHistory.push(this.currentCommand);
      this.terminal.writeln(""); // Newline for command output
      const foundCommand = this.registeredCommands.filter(
        (cmd) => cmd.command === keyword
      );
      if (foundCommand.length > 0) {
        this.isLocked = true;

        // Call command action
        const execution = foundCommand[0].callback(this, ...args);
        execution.then((answer) => this.terminal.write(answer || ""));

        // Unlock terminal and print prompt
        execution.finally(() => {
          this.isLocked = false;
          this.printPrompt();
        });
      } else {
        this.writeError(`${keyword}: command not found`);
        this.printPrompt();
      }
    } else {
      this.printPrompt();
    }
  }

  /**
   * Moves the terminal prompt a character left or right.
   * @param direction The arrow key pressed
   */
  private moveCursor(direction: "ArrowLeft" | "ArrowRight", count = 1): void {
    const cursorX = this.terminal.buffer.normal.cursorX;
    console.log(this.tPosition, (this.tPosition + 2) % this.terminal.cols);
    // Do not move over the prompt or the command end
    if (direction === "ArrowLeft") {
      if (this.tPosition == 0) {
        // Do not move (already at prompt)
        console.log("no move left");
        return;
      } else if (this.tPosition <= count) {
        // Move until the prompt
        console.log("move left to prompt", this.tPosition, 0);
        this.write(ansiEscapes.cursorMove(-this.tPosition));
        this.tPosition = 0;
      } else if ((this.tPosition + 2) % this.terminal.cols < count) {
        // Move requires line jump
        const moves = ((this.tPosition + 2) % this.terminal.cols) + 1;
        console.log("move left with line jump", moves, -1);
        this.write(ansiEscapes.cursorMove(this.terminal.cols, -1));
        this.tPosition -= moves;
        this.moveCursor("ArrowLeft", count - moves);
      } else {
        // Move cursor left
        console.log("move left", count, 0);
        this.write(ansiEscapes.cursorMove(-count));
        this.tPosition -= count;
      }
    } else if (direction === "ArrowRight") {
      if (this.tPosition === this.currentCommand.length) {
        // Do not move (already at the end of the command)
        console.log("no move right");
        return;
      } else if (this.tPosition + count >= this.currentCommand.length) {
        // Move until the end of the command
        const currRow = Math.floor((this.tPosition + 2) / this.terminal.rows);
        const destRow = Math.floor((this.tPosition + count + 2) / this.terminal.rows);
        const currColumn = (this.tPosition + 2) % this.terminal.rows;
        const destColumn = (this.currentCommand.length + 2) % this.terminal.rows;
        console.log("move right to end", destColumn - currColumn, destRow - currRow);
        this.write(ansiEscapes.cursorMove(destColumn - currColumn, destRow - currRow));
        this.tPosition = this.currentCommand.length;
      } else if (((this.tPosition + 2) % this.terminal.cols) + count >= this.terminal.cols) {
        // Move requires line jump
        const moves = this.terminal.cols - ((this.tPosition + 2) % this.terminal.cols);
        console.log("move right with line jump", moves, -1);
        this.write(ansiEscapes.cursorMove(-this.terminal.cols, +1));
        this.tPosition += moves;
        this.moveCursor("ArrowRight", count - moves);
      } else {
        // Move cursor right
        console.log("move right", count);
        this.write(ansiEscapes.cursorMove(+count));
        this.tPosition += count;
      }
    }
  }

  /**
   * Loads a command from the command history.
   * @param direction The arrow key pressed
   */
  private loadHistoryCommand(direction: "ArrowUp" | "ArrowDown"): void {
    const cursor = this.terminal.buffer.normal.cursorX;
    // The change to the current position in history depending on the pressed key
    const posChange = direction === "ArrowUp" ? -1 : 1;
    // Get the previous / next command if exists
    const cmd = this.commandHistory[this.commandHistoryPosition + posChange];
    if (cmd) {
      // Apply history position change
      this.commandHistoryPosition += posChange;
      // Clear all characters from the current terminal line
      const cursorOffsetToLineEnd = this.currentCommand.length - (cursor - 2);
      if (cursorOffsetToLineEnd !== 0) {
        // Clear characters to the right of the cursor
        this.write(" ".repeat(cursorOffsetToLineEnd));
      }
      // Clear characters to the left of the cursor
      const chars = cursor + cursorOffsetToLineEnd - 2;
      this.write("\b \b".repeat(chars));
      // Write history command
      this.write(cmd);
      this.currentCommand = cmd;
    }
  }

  /**
   * Handles raw keyboard events entered in the terminal.
   * @param event The keyboard event triggered
   * @returns True if the event should be further processed internally by xterm
   */
  private inputPreProcessing(event: KeyboardEvent): boolean {
    // Debug area start
    if (event.key === "#") {
      if (event.type === "keyup") {
        this.moveCursor("ArrowRight", 10);
      }
      event.preventDefault();
      return false;
    }
    // Debug area end
    
    // Block input while command is running
    if (this.isLocked) return false;

    // Prevent terminal handling of ctrl + v
    if (event.code === "KeyV" && event.ctrlKey) {
      return false;
    }
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        // Allow press and hold (ignore release)
        if (event.type === "keyup") return false;
        this.moveCursor(event.key);
        return false;
      case "ArrowUp":
      case "ArrowDown":
        // Do not allow press and hold (ignore press)
        if (event.type === "keydown") return false;
        this.loadHistoryCommand(event.key);
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
    const cursor = this.terminal.buffer.normal.cursorX;
    const columns = this.terminal.cols;
    switch (text) {
      case "\u0003": // Ctrl+C
        this.terminal.write("^C");
        this.printPrompt();
        break;
      case "\r": // Enter
        this.runCommand();
        this.commandHistoryPosition = this.commandHistory.length;
        this.currentCommand = "";
        this.tPosition = 0;
        break;
      case "\u007F": // Backspace (DEL)
        // Do not delete the prompt
        if (cursor > 2) {
          // Cut char at cursor position
          const first = this.currentCommand.slice(0, cursor - 3);
          const last = this.currentCommand.slice(cursor - 2);
          this.currentCommand = first + last;
          // Move cursor one char to the left, write remaining string again,
          // overwrite old last char with a space and then move the cursor
          // back to the cut position
          const moveCursorBack = "\x1b[D".repeat(last.length + 1);
          this.terminal.write("\x1b[D" + last + " " + moveCursorBack);
        }
        break;
      default:
        // Print all other characters (if printable)
        if (
          (text >= String.fromCharCode(0x20) &&
            text <= String.fromCharCode(0x7b)) ||
          text >= "\u00a0"
        ) {
          // Insert char / text at cursor position
          const first = this.currentCommand.slice(0, this.tPosition);
          const last = this.currentCommand.slice(this.tPosition);
          console.log(first, text, last);
          this.currentCommand = first + text + last;
          // Overwrite old contents with the inserted char / text,
          // followed by the remaining part and then move the cursor
          // back to the insert position
          const moveCursorBack = ansiEscapes.cursorMove(-last.length);
          this.terminal.write(text + last + moveCursorBack);
          this.tPosition += text.length;
        }
    }
  }

  /**
   * Opens and initializes the terminal.
   * @param parent The parent element to create the terminal in
   */
  public openTerminal(parent: HTMLElement | null): void {
    // Router needs reopen on each view
    this.terminal.open(parent || document.createElement("div"));
    if (!this.isOpen) {
      // Only initialize the terminal once
      this.initializeTerminal();
    }
    this.isOpen = true;
  }

  /**
   * Writes a red string to the terminal.
   * @param error The error string
   * @param prompt If the prompt should appear after printing the error
   */
  public writeError(error: string, prompt = false): void {
    this.terminal.writeln(`\x1b[31;1m${error}\x1b[0m`);
    //TODO: Chulk for unicode calculation?
    if (prompt) this.printPrompt();
  }

  /**
   * Writes the given text to the terminal followed by a newline character.
   * @param line The characters to write
   */
  public writeLine(line: string): void {
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
    this.terminal.clear();
  }
}
