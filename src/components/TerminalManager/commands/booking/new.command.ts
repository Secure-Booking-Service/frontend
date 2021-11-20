import { ICommand } from "../..";
import { booking } from '@/overmind/booking';
export const newCommand: ICommand = {
  command: "new",
  description: "Start a new booking process",
  callback: async (manager) => {
    booking.state.passengers
    if (booking.state.hasBookingStarted) {
      manager.writeError("A booking process has been already started!")
      manager.writeLine("Use 'show' to view the details or 'abort' to cancel the booking");
      return;
    }
    manager.writeLine("Start a new booking");
    booking.actions.newBooking();
  },
};