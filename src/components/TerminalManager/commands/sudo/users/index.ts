import { ICommand } from "../../..";
import { executeSubCommand } from "../../helper";
import { rolesCommand } from "./roles";


export const userCommand: ICommand = {
  command: "user",
  description: "Perform adjustments on users",
  callback: async (manager, ...args) => {
    const usage = "Usage: [...] user OPERATION";
    const registeredCommands = [ rolesCommand ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
