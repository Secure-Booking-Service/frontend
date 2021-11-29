import { ICommand } from "@/components/TerminalManager";
import { booking } from "@/overmind/booking";
import { api } from "@/store/utils/ApiUtil";
import { printApiError } from "../helper";
import { noCurrentBooking } from "./helpers";

export const closeCommand: ICommand = {
  command: "close",
  description: "Send the booking to GDS",
  usage: [],
  callback: async (manager) => {
    if (noCurrentBooking()) return;

    if (!booking.state.wasSuccessfullyValidated) {
      manager.writeError("Booking not reviewed! Use 'booking check' to review booking.");
      manager.writeLine();
      return;
    }

    try {

      const payload = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        creditCard: booking.state.creditCard!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        flightOffer: booking.state.flightOffer!,
        passengers: booking.state.passengers,
      };

      const apiReponse = await api.post('/bookings', payload);
      
      if (apiReponse.status !== 200) throw printApiError(apiReponse);

      booking.actions.abortBooking();      
      manager.writeSuccess("Booking closed successfully!", true);
    } catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
      
      manager.writeError("Booking was not closed!", true);
    }
  },
};
