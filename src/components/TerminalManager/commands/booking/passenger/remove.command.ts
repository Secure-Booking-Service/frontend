import { booking } from "@/overmind/booking";
import { ICommand } from "../../..";
import isNumeric from 'validator/lib/isNumeric';
import { printPassenger } from "./list.command";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove a passanger from booking",
  callback: async (manager, ...args) => {
    // current booking is validated in ./index.ts
    const usage = "Usage: [...] rm INDEX";

    if (args.length !== 1) {
      manager.writeError("Wrong number arguments! Expected 1 but got " + args.length);
      manager.writeLine(usage);
      return;
    }

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
      manager.writeError("Index out of bounce!");
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
