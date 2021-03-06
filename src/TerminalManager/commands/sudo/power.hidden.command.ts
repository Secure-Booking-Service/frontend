import { ICommand } from "@/TerminalManager";
import c from "ansi-colors";

export const powerCommand: ICommand = {
  command: "power",
  description: "Some superpowers for you!",
  hidden: true,
  callback: async (terminalMgr) => {
    const superpowers =
      c.green("S") +
      c.cyan("u") +
      c.magenta("p") +
      c.blue("e") +
      c.red("r") +
      c.yellow("p") +
      c.green("o") +
      c.cyan("w") +
      c.magenta("e") +
      c.blue("r") +
      c.red("s");
    terminalMgr.writeLine(`Some ${c.bold(superpowers)} for you!`);
    terminalMgr.Prompt = c.bold.green("root@sbs") + c.magenta.bold(" # ");
  },
};
