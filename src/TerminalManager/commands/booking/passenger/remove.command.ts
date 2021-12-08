import { booking } from "@/overmind/booking";
import { ICommand } from "@/TerminalManager";
import { printPassenger } from "./list.command";
import isNumeric from 'validator/lib/isNumeric';

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove a passenger from booking",
  usage: ["INDEX"],
  callback: async (manager, ...args) => {
    // current booking is validated in ./index.ts
    const [indexArg] = args;
    if (isNumeric(indexArg) && parseInt(indexArg) <= 0) {
      manager.writeError("Index must be a number and greater 0!");
      return;
    }

    if (booking.state.passengers.length === 0) {
      manager.writeError("Passenger list is empty!");
      return;
    }

    const index = Number(indexArg);

    if (booking.state.passengers.length < index) {
      manager.writeError("Index out of bounds!");
      manager.writeLine("Highest passenger index is " + booking.state.passengers.length);

      manager.writeLine();
      manager.writeError("No passenger deleted!", true);
    } else {
      const passenger = booking.actions.removePassenger(index - 1);      
      manager.writeLine();
      printPassenger(index, passenger, manager);
      manager.writeError("Passenger " + index + " removed!", true);
    }
  },
};
