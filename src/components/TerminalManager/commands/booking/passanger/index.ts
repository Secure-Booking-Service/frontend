import { ICommand } from "../../..";
import { executeSubCommand } from "../../helper";
import { addCommand } from "./add.command";
import { listCommand } from "./list.command";
import { removeCommand } from "./remove.command";

export const passangerCommand: ICommand = {
  command: "passanger",
  description: "Add, list and remove passangers from the booking",
  callback: async (manager, ...args) => {
    const usage = "Usage: booking passanger OPERATION";
    const registeredCommands = [ addCommand, listCommand, removeCommand ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    executeSubCommand(registeredCommands, manager, args);
  },
};
