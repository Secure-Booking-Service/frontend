import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export interface ICommand {
  command: string;
  description: string;
  callback: (userInput?: string) => string | void;
}

export class TerminalManager {
  private static _instance: TerminalManager;
  private static _terminal: Terminal;
  private currentCommand = "";
  private registeredCommands: ICommand[] = [];
  private commandHistory: string[] = [];

  private constructor() {
    TerminalManager._terminal = new Terminal({
      fontFamily: '"Cascadia Code", Menlo, monospace',
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

  private getHelp(): string {
    let helpString = "All available commands:\r\n";
    for (const cmd of TerminalManager.Instance.Commands) {
      helpString += `\r\n${cmd.command}\t\t${cmd.description}`;
    }
    return helpString + "\r\n";
  }

  public registerCommand(newCommand: ICommand): boolean {
    this.registeredCommands.push(newCommand);
    //TODO: Duplikate prüfen
    return true;
  }

  private initializeTerminal(): void {
    const fitAddon = new FitAddon();
    TerminalManager.Terminal.loadAddon(fitAddon);
    TerminalManager.Terminal.attachCustomKeyEventHandler(
      this.inputPreProcessing
    );
    TerminalManager.Terminal.onData(this.inputProcessing.bind(this));
    this.registerCommand({
      command: "help",
      description: "Prints this help message.",
      callback: this.getHelp,
    });
    TerminalManager.Terminal.writeln("Welcome to the Secure Booking Service!");
    TerminalManager.Terminal.writeln(
      "Type `help` for a list of available commands."
    );
    this.printPrompt();
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
        const answer = foundCommand[0].callback(args);
        TerminalManager.Terminal.write(answer || "");
      } else {
        TerminalManager.Terminal.writeln(`${keyword}: command not found`);
      }
    }
    this.printPrompt();
  }

  private inputPreProcessing(event: KeyboardEvent): boolean {
    console.log(event.key); // TODO: Remove console statement
    switch (event.key) {
      case "ArrowLeft":
        // Left pressed
        return false;
      case "ArrowRight":
        // Right pressed
        return false;
      case "ArrowUp":
        // Up pressed
        return false;
      case "ArrowDown":
        // Down pressed
        return false;
      default:
        return true;
    }
  }

  private inputProcessing(char: string): void {
    switch (char) {
      case "\u0003": // Ctrl+C
        TerminalManager.Terminal.write("^C");
        this.printPrompt();
        break;
      case "\r": // Enter
        this.runCommand();
        this.currentCommand = "";
        break;
      case "\u007F": // Backspace (DEL)
        // Do not delete the prompt
        if (TerminalManager.Terminal.buffer.normal.cursorX > 2) {
          TerminalManager.Terminal.write("\b \b");
          if (this.currentCommand.length > 0) {
            this.currentCommand = this.currentCommand.substr(
              0,
              this.currentCommand.length - 1
            );
          }
        }
        break;
      default:
        // Print all other characters (if prrintable)
        if (
          (char >= String.fromCharCode(0x20) &&
            char <= String.fromCharCode(0x7b)) ||
          char >= "\u00a0"
        ) {
          this.currentCommand += char;
          TerminalManager.Terminal.write(char);
        }
    }
  }

  public openTerminal(parent: HTMLElement | null): void {
    TerminalManager.Terminal.open(parent || document.createElement("div"));
    this.initializeTerminal();
  }
}
