import { ICommand } from "@/TerminalManager";
import { executeSubCommand } from "../../helper";
import { roleCommand } from "./role";


export const userCommand: ICommand = {
  command: "user",
  description: "Perform adjustments on a user",
  callback: async (manager, ...args) => {
    const usage = "Usage: [...] user OPERATION";
    const registeredCommands = [ roleCommand ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
