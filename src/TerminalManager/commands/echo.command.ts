import { ICommand } from "..";

export const echoCommand: ICommand = {
  command: "echo",
  description: "Reflects all text input back to the console output.",
  callback: async (terminalMgr, ...args) => {
    return args.join(" ") + "\r\n";
  },
};
