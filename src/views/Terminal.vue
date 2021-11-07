<template>
  <div id="xterm"></div>
</template>

<script lang="ts">
import { TerminalManager } from "../components/TerminalManager/index";
import { Options, Vue } from "vue-class-component";
import "xterm/css/xterm.css";

// Demo area start
TerminalManager.Instance.registerCommand({
  command: "echo",
  description: "Reflects all text input back to the console output.",
  callback: (userInput) => {
    return userInput + "\r\n";
  },
});
// Demo area end

@Options({
  components: {},
  mounted() {
    TerminalManager.Instance.openTerminal(document.getElementById("xterm"));
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
