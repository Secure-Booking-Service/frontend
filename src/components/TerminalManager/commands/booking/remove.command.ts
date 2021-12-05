import { ICommand } from "@/components/TerminalManager";
import { user } from "@/overmind/user";
import { api } from "@/store/utils/ApiUtil";
import { Roles } from "@secure-booking-service/common-types/Roles";
import { yellow } from "ansi-colors";
import { printApiError } from "../helper";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Delete a booking",
  usage: ["BOOKING-ID"],
  callback: async (manager, bookingId) => {
    // Check if user has enough permissions
    if (!user.state.roles.includes(Roles.TRAVELLEAD))
      return manager.writeError("Unauthorized: You dont have the permission to delete bookings!");

    // Input validation
    if (!/^[0-9a-fA-F]{24}$/.test(bookingId))
      return manager.writeError("Invalid booking id format, please check your input!");


    // Delete booking
    try {
      const apiResponse = await api.delete(`/bookings/${bookingId}`);
      if (apiResponse.status !== 204) throw printApiError(apiResponse);

      manager.writeSuccess(`Booking ${yellow.bold(bookingId)} successfully deleted!`, true);
    }
    catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
      manager.writeError("Booking was not deleted!", true);
    }
  },
};
