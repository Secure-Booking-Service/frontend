<template>
  <div id="xterm"></div>
</template>

<script lang="ts">
import { TerminalManager } from "../components/TerminalManager/index";
import { Options, Vue } from "vue-class-component";
import "xterm/css/xterm.css";

@Options({
  components: {},
  mounted() {
    TerminalManager.Instance.openTerminal(document.getElementById("xterm"));
  },
})
export default class TerminalView extends Vue {}
</script>

<style>
#xterm {
  min-height: calc(100vh - 20px);
  width: calc(100vw - 40px);
  background-color: #2d2e2c;
  padding: 10px 20px;
}
.xterm-viewport.xterm-viewport {
  scrollbar-width: thin;
}
</style>
