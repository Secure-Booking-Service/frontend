import { ICommand } from "@/TerminalManager";
import { executeSubCommand } from "../helper";
import { powerCommand } from "./power.hidden.command";
import { userCommand } from "./user";

export const sudoCommand: ICommand = {
  command: "sudo",
  description: "With great power comes great responsibility!",
  loginRequired: true,
  callback: async (manager, ...args) => {
    const usage = "Usage: sudo OPERATION";
    const registeredCommands = [ powerCommand, userCommand ];
    
    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
