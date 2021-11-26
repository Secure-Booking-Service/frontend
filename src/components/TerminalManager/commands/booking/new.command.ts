import { ICommand } from "@/components/TerminalManager";
import { booking } from '@/overmind/booking';
export const newCommand: ICommand = {
  command: "new",
  description: "Start a new booking process",
  callback: async (manager) => {
    if (booking.state.hasBookingStarted) {
      manager.writeError("A booking process has been already started!")
      manager.writeLine("Use 'check' to view the details or 'abort' to cancel the booking");
      return;
    }
    manager.writeSuccess("New booking created", true);
    booking.actions.newBooking();
  },
};
