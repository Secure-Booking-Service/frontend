import { ICommand } from "../../..";
import { executeSubCommand } from "../../helper";


export const creditcardCommand: ICommand = {
  command: "creditcard",
  description: "Add, list and remove a creditcard from the booking",
  callback: async (manager, ...args) => {
    const usage = "Usage: booking creditcard OPERATION";
    const registeredCommands: ICommand[] = [];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    executeSubCommand(registeredCommands, manager, args);
  },
};
