import { TerminalManager } from "@/TerminalManager";
import "xterm/css/xterm.css";
import "./main.css"; 

TerminalManager.Instance.openTerminal(document.getElementById("xterm"));
