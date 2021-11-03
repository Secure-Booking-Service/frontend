<template>
  <div id="xterm"></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

terminal.attachCustomKeyEventHandler((ev: KeyboardEvent) => {
  console.log(ev.key.charCodeAt(0));
  if (ev.key.charCodeAt(0) == 13) terminal.write("\n");
  terminal.write(ev.key);

  return true;
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
</style>