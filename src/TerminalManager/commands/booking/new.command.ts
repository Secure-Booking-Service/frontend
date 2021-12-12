import { ICommand } from "@/TerminalManager";
import { booking } from '@/overmind/booking';
import { Roles } from "@secure-booking-service/common-types/Roles";
import { user } from "@/overmind/user";
export const newCommand: ICommand = {
  command: "new",
  description: "Start a new booking process",
  callback: async (manager) => {
    // Check if user has enough permissions
    if (![Roles.TRAVELAGENT, Roles.TRAVELLEAD].some(role => user.state.roles.includes(role)))
      return manager.writeError("Unauthorized: You dont have the permission to create bookings!");

    if (booking.state.hasBookingStarted) {
      manager.writeError("A booking process has been already started!");
      manager.writeLine("Use 'check' to view the details or 'abort' to cancel the booking");
      return;
    }
    manager.writeSuccess("New booking created", true);
    booking.actions.newBooking();
  },
};
