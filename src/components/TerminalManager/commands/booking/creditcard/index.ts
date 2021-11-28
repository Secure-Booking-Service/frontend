import { ICommand } from "@/components/TerminalManager";
import { executeSubCommand } from "../../helper";
import { noCurrentBooking } from "../helpers";
import { addCommand } from "./add.command";
import { listCommand } from "./list.command";
import { removeCommand } from "./remove.command";


export const creditcardCommand: ICommand = {
  command: "creditcard",
  description: "Add, list and remove a creditcard from the booking",
  callback: async (manager, ...args) => {
    const usage = "Usage: booking creditcard OPERATION";
    const registeredCommands: ICommand[] = [ addCommand, listCommand, removeCommand ];

    if (noCurrentBooking()) return;

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
