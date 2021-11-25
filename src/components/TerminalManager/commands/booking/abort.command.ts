import { booking } from "@/overmind/booking";
import { ICommand } from "@/components/TerminalManager";
import { noCurrentBooking } from './helpers';

export const abortCommand: ICommand = {
  command: "abort",
  description: "Abort the current booking",
  callback: async (manager, ...args) => {
    if (noCurrentBooking(manager)) return;

    if (!args.includes('-f')) {
      manager.writeLine("Are you sure to cancel to current booking?")
      manager.writeLine("Use 'booking abort -f' to cancel the current booking!")
      manager.writeError("Booking was not aborted!", true)
      return;
    }

    booking.actions.abortBooking();
    manager.writeSuccess("Booking was aborted!", true)
  },
};
