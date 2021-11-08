import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import router from "../../router/index";

export interface ICommand {
  command: string;
  description: string;
  callback: (terminalMgr: TerminalManager, userInput?: string) => string | void;
}

export class TerminalManager {
  private static _instance: TerminalManager;
  private static _terminal: Terminal;
  private currentCommand = "";
  private registeredCommands: ICommand[] = [];
  private commandHistory: string[] = [];
  private commandHistoryPosition = 0;
  private isOpen = false;

  private constructor() {
    TerminalManager._terminal = new Terminal({
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

  public static get Instance(): TerminalManager {
    return this._instance || (this._instance = new this());
  }

  public static get Terminal(): Terminal {
    if (!this._instance) {
      this._instance = new this();
    }
    return this._terminal;
  }

  public get Commands(): ICommand[] {
    return this.registeredCommands;
  }

  private printPrompt(): void {
    this.currentCommand = "";
    TerminalManager.Terminal.write("\r\n$ ");
  }

  public registerCommand(newCommand: ICommand): boolean {
    const existingCommand = this.registeredCommands.filter(
      (cmd) => cmd.command === newCommand.command
    );
    if (existingCommand.length > 0) {
      this.writeError(
        `Failed to register "${newCommand.command}": command already exists!`
      );
    }
    this.registeredCommands.push(newCommand);
    this.registeredCommands.sort((a, b) => a.command.localeCompare(b.command));
    return true;
  }

  private initializeTerminal(): void {
    const fitAddon = new FitAddon();
    TerminalManager.Terminal.loadAddon(fitAddon);
    fitAddon.fit();
    TerminalManager.Terminal.attachCustomKeyEventHandler(
      this.inputPreProcessing.bind(this)
    );
    TerminalManager.Terminal.onData(this.inputProcessing.bind(this));
    TerminalManager.Terminal.writeln("Welcome to the Secure Booking Service!");
    TerminalManager.Terminal.writeln(
      "Type `help` for a list of available commands."
    );
    this.printPrompt();
    this.registerCommand({
      command: "help",
      description: "Prints this help message.",
      callback: (terminalMgr) => {
        terminalMgr.writeLine("All available commands:\r\n");
        for (const cmd of TerminalManager.Instance.Commands) {
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
        TerminalManager.Terminal.clear();
      },
    });
  }

  private runCommand(): void {
    const [keyword, args] = this.currentCommand.trim().split(" ");
    if (keyword.length > 0) {
      this.commandHistory.push(this.currentCommand);
      TerminalManager.Terminal.writeln("");
      const foundCommand = this.registeredCommands.filter(
        (cmd) => cmd.command === keyword
      );
      if (foundCommand.length > 0) {
        const answer = foundCommand[0].callback(this, args);
        TerminalManager.Terminal.write(answer || "");
      } else {
        this.writeError(`${keyword}: command not found`, false);
      }
    }
    this.printPrompt();
  }

  private inputPreProcessing(event: KeyboardEvent): boolean {
    // Prevent terminal handling of ctrl + v
    if (event.code === "KeyV" && event.ctrlKey) {
      return false;
    }
    switch (event.key) {
      case "ArrowLeft": {
        // Left pressed
        if (event.type === "keyup") return false;
        const cursor = TerminalManager.Terminal.buffer.normal.cursorX;
        if (cursor > 2) {
          this.write("\x1b[D");
        }
        return false;
      }
      case "ArrowRight": {
        // Right pressed
        if (event.type === "keyup") return false;
        const cursor = TerminalManager.Terminal.buffer.normal.cursorX;
        if (cursor < this.currentCommand.length + 2) {
          this.write("\x1b[C");
        }
        return false;
      }
      case "ArrowUp": {
        // Up pressed
        if (event.type === "keydown") return false;
        const cmd = this.commandHistory[this.commandHistoryPosition - 1];
        if (cmd) {
          this.commandHistoryPosition -= 1;
          const chars = TerminalManager.Terminal.buffer.normal.cursorX - 2;
          this.write("\b \b".repeat(chars));
          this.write(cmd);
          this.currentCommand = cmd;
        }
        return false;
      }
      case "ArrowDown": {
        // Down pressed
        if (event.type === "keydown") return false;
        const cmd = this.commandHistory[this.commandHistoryPosition + 1];
        if (cmd) {
          this.commandHistoryPosition += 1;
          const chars = TerminalManager.Terminal.buffer.normal.cursorX - 2;
          this.write("\b \b".repeat(chars));
          this.write(cmd);
          this.currentCommand = cmd;
        }
        return false;
      }
      default:
        return true;
    }
  }

  private inputProcessing(char: string): void {
    const cursor = TerminalManager.Terminal.buffer.normal.cursorX;
    switch (char) {
      case "\u0003": // Ctrl+C
        TerminalManager.Terminal.write("^C");
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
            TerminalManager.Terminal.write("\x1b[D" + last + " " + moveCursor);
          }
        }
        break;
      default:
        // Print all other characters (if printable)
        if (
          (char >= String.fromCharCode(0x20) &&
            char <= String.fromCharCode(0x7b)) ||
          char >= "\u00a0"
        ) {
          const first = this.currentCommand.slice(0, cursor - 2);
          const last = this.currentCommand.slice(cursor - 2);
          this.currentCommand = first + char + last;
          const moveCursor = "\x1b[D".repeat(
            this.currentCommand.length - cursor + 1
          );
          if (char.length === 1) {
            TerminalManager.Terminal.write(char + last + moveCursor);
          } else {
            TerminalManager.Terminal.write(char + last);
          }
        }
    }
  }

  public openTerminal(parent: HTMLElement | null): void {
    TerminalManager.Terminal.open(parent || document.createElement("div"));
    if (!this.isOpen) {
      this.initializeTerminal();
    }
    this.isOpen = true;
  }

  public writeError(error: string, prompt = true): void {
    TerminalManager.Terminal.writeln(`\x1b[31;1m${error}\x1b[0m`);
    if (prompt) this.printPrompt();
  }

  public writeLine(line: string): void {
    TerminalManager.Terminal.writeln(line);
  }

  public write(text: string): void {
    TerminalManager.Terminal.write(text);
  }
}
