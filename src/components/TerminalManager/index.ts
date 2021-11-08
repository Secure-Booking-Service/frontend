import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import router from "../../router/index";

/**
 * Object schema for registering a new command.
 * command: The keyword to listen on terminal input
 * description: A short description printed by the `help`command
 * callback: The function to process the user input.
 */
export interface ICommand {
  command: string;
  description: string;
  callback: (terminalMgr: TerminalManager, userInput?: string) => string | void;
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
  }

  /**
   * Registers a new command to the terminal.
   * @param newCommand The command to register
   * @returns True if the command is registered successfully
   */
  public registerCommand(newCommand: ICommand): boolean {
    const existingCommand = this.registeredCommands.filter(
      (cmd) => cmd.command === newCommand.command
    );
    if (existingCommand.length > 0) {
      this.writeError(
        `Failed to register "${newCommand.command}": command already exists!`
      );
      return false;
    }
    this.registeredCommands.push(newCommand);
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
    const fitAddon = new FitAddon();
    this.terminal.loadAddon(fitAddon);
    fitAddon.fit();
    this.terminal.attachCustomKeyEventHandler(
      this.inputPreProcessing.bind(this)
    );
    this.terminal.onData(this.inputProcessing.bind(this));
    this.terminal.writeln("Welcome to the Secure Booking Service!");
    this.terminal.writeln("Type `help` for a list of available commands.");
    this.printPrompt();
    this.registerCommand({
      command: "help",
      description: "Prints this help message.",
      callback: (terminalMgr) => {
        terminalMgr.writeLine("All available commands:\r\n");
        for (const cmd of this.registeredCommands) {
          terminalMgr.writeLine(`${cmd.command}\t\t${cmd.description}`);
        }
      },
    });
    this.registerCommand({
      command: "man",
      description: "Opens the documentation page.",
      callback: () => {
        router.push("/manual");
        return "Opening documentation page...\r\n";
      },
    });
    this.registerCommand({
      command: "clear",
      description: "Too much text? This helps.",
      callback: () => {
        this.terminal.clear();
      },
    });
  }

  /**
   * Searches and executes the command entered at the terminal.
   */
  private runCommand(): void {
    const [keyword, args] = this.currentCommand.trim().split(" ");
    if (keyword.length > 0) {
      this.commandHistory.push(this.currentCommand);
      this.terminal.writeln("");
      const foundCommand = this.registeredCommands.filter(
        (cmd) => cmd.command === keyword
      );
      if (foundCommand.length > 0) {
        const answer = foundCommand[0].callback(this, args);
        this.terminal.write(answer || "");
      } else {
        this.writeError(`${keyword}: command not found`, false);
      }
    }
    this.printPrompt();
  }

  /**
   * Moves the terminal prompt a character left or right.
   * @param direction The arrow key pressed
   */
  private moveCursor(direction: "ArrowLeft" | "ArrowRight"): void {
    const cursor = this.terminal.buffer.normal.cursorX;
    if (direction === "ArrowLeft" && cursor > 2) {
      this.write("\x1b[D");
    } else if (
      direction === "ArrowRight" &&
      cursor < this.currentCommand.length + 2
    ) {
      this.write("\x1b[C");
    }
  }

  /**
   * Loads a command from the command history.
   * @param direction The arrow key pressed
   */
  private loadHistoryCommand(direction: "ArrowUp" | "ArrowDown"): void {
    if (direction === "ArrowUp") {
      const cmd = this.commandHistory[this.commandHistoryPosition - 1];
      if (cmd) {
        this.commandHistoryPosition -= 1;
        const chars = this.terminal.buffer.normal.cursorX - 2;
        this.write("\b \b".repeat(chars));
        this.write(cmd);
        this.currentCommand = cmd;
      }
    } else if (direction === "ArrowDown") {
      const cmd = this.commandHistory[this.commandHistoryPosition + 1];
      if (cmd) {
        this.commandHistoryPosition += 1;
        const chars = this.terminal.buffer.normal.cursorX - 2;
        this.write("\b \b".repeat(chars));
        this.write(cmd);
        this.currentCommand = cmd;
      }
    }
  }

  /**
   * Handles raw keyboard events entered in the terminal.
   * @param event The keyboard event triggered
   * @returns True if the event should be further processed internally by xterm
   */
  private inputPreProcessing(event: KeyboardEvent): boolean {
    // Prevent terminal handling of ctrl + v
    if (event.code === "KeyV" && event.ctrlKey) {
      return false;
    }
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        // Left or right pressed
        if (event.type === "keyup") return false;
        this.moveCursor(event.key);
        return false;
      case "ArrowUp":
      case "ArrowDown":
        // Up or down pressed
        if (event.type === "keydown") return false;
        this.loadHistoryCommand(event.key);
        return false;
      default:
        return true;
    }
  }

  /**
   * Handles all characters entered in the terminal.
   * @param text A single entered character or pasted string
   */
  private inputProcessing(text: string): void {
    const cursor = this.terminal.buffer.normal.cursorX;
    switch (text) {
      case "\u0003": // Ctrl+C
        this.terminal.write("^C");
        this.printPrompt();
        break;
      case "\r": // Enter
        this.runCommand();
        this.commandHistoryPosition = this.commandHistory.length;
        this.currentCommand = "";
        break;
      case "\u007F": // Backspace (DEL)
        // Do not delete the prompt
        if (cursor > 2) {
          if (this.currentCommand.length > 0) {
            const first = this.currentCommand.slice(0, cursor - 3);
            const last = this.currentCommand.slice(cursor - 2);
            this.currentCommand = first + last;
            const moveCursor = "\x1b[D".repeat(
              this.currentCommand.length - cursor + 4
            );
            this.terminal.write("\x1b[D" + last + " " + moveCursor);
          }
        }
        break;
      default:
        // Print all other characters (if printable)
        if (
          (text >= String.fromCharCode(0x20) &&
            text <= String.fromCharCode(0x7b)) ||
          text >= "\u00a0"
        ) {
          const first = this.currentCommand.slice(0, cursor - 2);
          const last = this.currentCommand.slice(cursor - 2);
          this.currentCommand = first + text + last;
          const moveCursor = "\x1b[D".repeat(
            this.currentCommand.length - cursor + 1
          );
          if (text.length === 1) {
            this.terminal.write(text + last + moveCursor);
          } else {
            this.terminal.write(text + last);
          }
        }
    }
  }

  /**
   * Opens and initializes the terminal.
   * @param parent The parent element to create the terminal in
   */
  public openTerminal(parent: HTMLElement | null): void {
    this.terminal.open(parent || document.createElement("div"));
    if (!this.isOpen) {
      this.initializeTerminal();
    }
    this.isOpen = true;
  }

  /**
   * Writes a red string to the terminal.
   * @param error The error string
   * @param prompt If the prompt should appear after printing the error
   */
  public writeError(error: string, prompt = true): void {
    this.terminal.writeln(`\x1b[31;1m${error}\x1b[0m`);
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
}
