import { ICommand } from "@/components/TerminalManager";
import { executeSubCommand } from "../../../helper";
import { addCommand } from "./add.command";


export const rolesCommand: ICommand = {
  command: "roles",
  description: "Add or remove a role from a user",
  callback: async (manager, ...args) => {
    const usage = "Usage: [...] roles OPERATION";
    const registeredCommands = [ addCommand ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
