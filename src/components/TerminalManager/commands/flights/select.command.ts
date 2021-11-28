import { ICommand } from "@/components/TerminalManager";
import { booking } from "@/overmind/booking";
import { flights } from "@/overmind/flights";
import { FlightOffer } from "@secure-booking-service/common-types";
import isInt from 'validator/lib/isInt';
import { noCurrentBooking } from "../booking/helpers";
import { printFlightOffer } from "./helpers";

export const selectCommand: ICommand = {
  command: "select",
  description: "Select a flight",
  usage: ["FLIGHT-ID"],
  callback: async (manager, ...args) => {
    if (noCurrentBooking()) return;

    if (flights.state.flightOffers.length === 0) {
      manager.writeError("No flight offers for selection found!", true);
      manager.writeLine("Use 'flight search' to get available flights");
      return;
    }

    const [ flightId ] = args;
    
    // Input validation
    const bounds = {
      min: 1,
      max: flights.state.flightOffers.length
    };
    if (!isInt(flightId, bounds)) {
        manager.writeError("Invalid flight id");
        manager.writeLine("Please enter a number between 1 and " + flights.state.flightOffers.length);
        manager.writeLine();
        return;
    }

    // Add flight offer to booking
    const index = parseInt(flightId) - 1;
    const selectedFlightOffer = flights.state.flightOffers[index];
    const selectedFlightOfferCopy = JSON.parse(JSON.stringify(selectedFlightOffer)) as FlightOffer;
    booking.actions.addFlightOffer(selectedFlightOfferCopy);

    // Print confirmation
    printFlightOffer(selectedFlightOffer, index + 1);
    manager.writeSuccess("The above flight order has been selected", true);

  },
};
