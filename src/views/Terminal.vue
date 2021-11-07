<template>
  <div id="xterm"></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

interface Command {
  command: string;
  description: string;
  callback: (userInput: string) => string;
}

var baseTheme = {
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
};

const terminal = new Terminal({
  fontFamily: '"Cascadia Code", Menlo, monospace',
  cursorBlink: true,
  theme: baseTheme,
});
let command = "";
let commands: Command[] = [];
initializeTerminal();

function initializeTerminal(): void {
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.writeln("Welcome to the Secure Booking Service!");
  terminal.writeln("Type `help` for a list of available commands.");
  prompt();
}

function prompt(): void {
  command = "";
  terminal.write("\r\n$ ");
}

export function registerCommand(newCommand: Command): boolean {
  commands.push(newCommand);
  return true;
}

function runCommand(text: string): void {
  const keyword = text.trim().split(" ")[0];
  if (keyword.length > 0) {
    terminal.writeln("");
    const foundCommand = commands.filter((cmd) => cmd.command === keyword);
    if (foundCommand.length > 0) {
      const answer = foundCommand[0].callback(text);
      terminal.write(answer);
      return;
    }
    terminal.writeln(`${keyword}: command not found`);
  }
  prompt();
}

terminal.onData((e) => {
  switch (e) {
    case "\u0003": // Ctrl+C
      terminal.write("^C");
      prompt();
      break;
    case "\r": // Enter
      runCommand(command);
      command = "";
      break;
    case "\u007F": // Backspace (DEL)
      // Do not delete the prompt
      if (terminal.cols > 2) {
        terminal.write("\b \b");
        if (command.length > 0) {
          command = command.substr(0, command.length - 1);
        }
      }
      break;
    default:
      // Print all other characters for demo
      if (
        (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7b)) ||
        e >= "\u00a0"
      ) {
        command += e;
        terminal.write(e);
      }
  }
});

@Options({
  components: {},
  mounted() {
    terminal.open(
      document.getElementById("xterm") || document.createElement("div")
    );
  },
})
export default class TerminalView extends Vue {}
</script>

<style>
.xterm {
  display: inline-block;
  border-radius: 4px;
  background-color: #2d2e2c;
}
.terminal.xterm {
  padding: 10px 20px;
}
#xterm {
  text-align: center;
  margin: 0 auto;
}
.xterm-viewport.xterm-viewport {
  scrollbar-width: thin;
}
.xterm .xterm-viewport {
  background-color: #000;
  overflow-y: scroll;
  cursor: default;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
}
</style>
