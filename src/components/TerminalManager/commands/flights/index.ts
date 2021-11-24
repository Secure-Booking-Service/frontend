import { ICommand } from "../..";
import { executeSubCommand } from "../helper";
import { selectCommand } from "./select.command";
import { searchCommand } from "./search.command";

export const flightCommand: ICommand = {
  command: "flight",
  description: "Search or select a flight",
  callback: async (manager, ...args) => {
    const usage = "Usage: flight OPERATION";
    const registeredCommands = [ selectCommand, searchCommand ];
    
    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    executeSubCommand(registeredCommands, manager, args);
  },
};
