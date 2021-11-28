import { booking } from "@/overmind/booking";
import { ICommand } from "@/components/TerminalManager";
import { noCurrentBooking } from './helpers';

export const abortCommand: ICommand = {
  command: "abort",
  description: "Abort the current booking",
  callback: async (manager) => {
    if (noCurrentBooking()) return;

    const question = "Are you sure to cancel to current booking?";
    const answer = await manager.runUserQuery(question);
    if (answer === 'n') {
      manager.writeError("Booking was not aborted!", true);
      return;
    }

    booking.actions.abortBooking();
    manager.writeSuccess("Booking was aborted!", true);
  },
};
