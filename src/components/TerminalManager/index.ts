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
  private prompt = "$ ";
  private pLength = 2; // The number of chars in the last line of the prompt
  private registeredCommands: ICommand[] = [];
  private commandHistory: string[] = [];
  private commandHistoryPosition = 0;
  private isOpen = false; // If the terminal has been initialized already
  private tPosition = 0; // Position of cursor in current command
  private isLocked = false; // Locks terminal during command execution

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
    //TODO: Add dynamic padding based on prompt (dynamic prompt)
  }

  /**
   * Setter
   * @param prompt The new prompt to use. Can include newlines
   */
  public set Prompt(prompt: string) {
    this.prompt = prompt;
    // Update length of prompt (last line)
    const index = prompt.lastIndexOf("\n");
    if (index == -1) this.pLength = prompt.length;
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
    // Fit terminal on window resize
    window.onresize = () => {
      fitAddon.fit();
    };
    // Add raw keyboard event handler
    this.terminal.attachCustomKeyEventHandler(
      this.inputPreProcessing.bind(this)
    );
    // Add key / paste event handler
    this.terminal.onData(this.inputProcessing.bind(this));
    // Print welcome message
    // TODO: Insert impressum link?
    this.terminal.writeln(
      `Welcome to the ${c.blue(c.bold("Secure Booking Service"))}!`
    );
    this.terminal.writeln(
      `Type ${c.yellow(c.bold("help"))} for a list of available commands.`
    );
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
    //TODO: Hidden commands (klir, sudo, etc.)
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
   * Moves the terminal prompt left or right.
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
    } else if (count < 0) {
      // Do not move left if already at the prompt
      if (this.tPosition == 0) return;

      // Do not move left beyond the prompt
      if (this.tPosition + count < 0) count = -this.tPosition;
    } else {
      // Zero move
      return;
    }

    // Move cusor and calculate potential line jumps
    const currRow = Math.floor(
      (this.tPosition + this.pLength) / this.terminal.cols
    );
    const destRow = Math.floor(
      (this.tPosition + count + this.pLength) / this.terminal.cols
    );
    const currColumn = (this.tPosition + this.pLength) % this.terminal.cols;
    const destColumn =
      (this.tPosition + count + this.pLength) % this.terminal.cols;
    this.write(
      ansiEscapes.cursorMove(destColumn - currColumn, destRow - currRow)
    );
    this.tPosition += count;
  }

  /**
   * Loads a command from the command history.
   * @param direction The arrow key pressed
   */
  private loadHistoryCommand(direction: "ArrowUp" | "ArrowDown"): void {
    // The change to the current position in history depending on the pressed key
    const posChange = direction === "ArrowUp" ? -1 : 1;
    // Get the previous / next command if exists
    const cmd = this.commandHistory[this.commandHistoryPosition + posChange];
    if (cmd) {
      // Apply history position change
      this.commandHistoryPosition += posChange;
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
        this.Prompt = `${c.green(c.bold("root@localhost"))} # `;
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
        // Allow press and hold (ignore release)
        if (event.type === "keyup") return false;
        this.moveCursor(-1);
        return false;
      case "ArrowRight":
        // Allow press and hold (ignore release)
        if (event.type === "keyup") return false;
        this.moveCursor(+1);
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
        this.commandHistoryPosition = this.commandHistory.length;
        this.currentCommand = "";
        this.tPosition = 0;
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
        // Print all other characters (if printable)
        if (
          (text >= String.fromCharCode(0x20) &&
            text <= String.fromCharCode(0x7b)) ||
          text >= "\u00a0"
        ) {
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
    this.terminal.writeln(c.red(c.bold(error)));
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
    this.terminal.write(ansiEscapes.clearTerminal);
  }
}
