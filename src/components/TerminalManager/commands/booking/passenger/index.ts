import { ICommand } from "@/components/TerminalManager";
import { executeSubCommand } from "../../helper";
import { noCurrentBooking } from "../helpers";
import { addCommand } from "./add.command";
import { listCommand } from "./list.command";
import { removeCommand } from "./remove.command";

export const passengerCommand: ICommand = {
  command: "passenger",
  description: "Add, list and remove passenger from the booking",
  callback: async (manager, ...args) => {
    const usage = "Usage: booking passenger OPERATION";
    const registeredCommands = [ addCommand, listCommand, removeCommand ];
    
    if (noCurrentBooking()) return;

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    executeSubCommand(registeredCommands, args);
  },
};
