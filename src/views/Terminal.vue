<template>
  <div id="xterm"></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const terminal = new Terminal({
    fontFamily: '"Cascadia Code", Menlo, monospace',
    cursorBlink: true
  });
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

//terminal.attachCustomKeyEventHandler((ev: KeyboardEvent) => {
//  console.log(ev.key.charCodeAt(0));
//  if (ev.key.charCodeAt(0) == 13) terminal.write("\n");
//  terminal.write(ev.key);
//
//  return true;
//});

    terminal.onData(e => {
      switch (e) {
        case '\u0003': // Ctrl+C
          terminal.write('^C');
          //prompt(terminal);
          break;
        case '\r': // Enter
          //runCommand(terminal, command);
          //command = '';
          terminal.write('\r\n')
          break;
        case '\u007F': // Backspace (DEL)
          // Do not delete the prompt
          terminal.write('<Backspace>')
          //if (terminal._core.buffer.x > 2) {
          //  terminal.write('\b \b');
          //  if (command.length > 0) {
          //    command = command.substr(0, command.length - 1);
          //  }
          //}
          break;
        default: // Print all other characters for demo
          if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7B) || e >= '\u00a0') {
            //command += e;
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
}
</style>