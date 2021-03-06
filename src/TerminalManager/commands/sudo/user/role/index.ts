import { ICommand } from "@/TerminalManager";
import { executeSubCommand } from "../../../helper";
import { addCommand } from "./add.command";
import { removeCommand } from "./remove.command";


export const roleCommand: ICommand = {
  command: "role",
  description: "Add or remove a role from a user",
  callback: async (manager, ...args) => {
    const usage = "Usage: [...] roles OPERATION";
    const registeredCommands = [ addCommand, removeCommand ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
