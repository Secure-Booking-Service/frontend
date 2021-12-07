import { ICommand } from "@/TerminalManager";
import { executeSubCommand } from "../helper";
import { abortCommand } from "./abort.command";
import { checkCommand } from "./check.command";
import { closeCommand } from "./close.command";
import { creditcardCommand } from "./creditcard";
import { listCommand } from "./list.command";
import { newCommand } from "./new.command";
import { passengerCommand } from "./passenger";
import { removeCommand } from "./remove.command";

export const bookingCommand: ICommand = {
  command: "booking",
  description: "Manage the current booking",
  loginRequired: true,
  callback: async (manager, ...args) => {
    const usage = "Usage: booking OPERATION";
    const registeredCommands = [
      newCommand,
      passengerCommand,
      creditcardCommand,
      closeCommand,
      checkCommand,
      abortCommand,
      listCommand,
      removeCommand
    ];

    if (args.length === 0) {
      manager.writeError("Missing operation!");
      return manager.writeLine(usage);
    }

    await executeSubCommand(registeredCommands, args);
  },
};
