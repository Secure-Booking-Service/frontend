import { AxiosRequestConfig } from "axios";
import { ICommand } from "@/TerminalManager";
import { api } from "@/utils/ApiUtil";
import { booking } from "@/overmind/booking";
import { noCurrentBooking } from "../booking/helpers";
import { printApiError } from "../helper";
import isDate from 'validator/lib/isDate';
import isAfter from 'validator/lib/isAfter';
import isUppercase from 'validator/lib/isUppercase';
import isLength from 'validator/lib/isLength';
import { flights } from "@/overmind/flights";
import { printFlightOffers } from "./helpers";
import { blue } from "ansi-colors";

export const searchCommand: ICommand = {
  command: "search",
  description: "Search a flight",
  usage: ["ORIGIN-CODE", "DESTINATION-CODE", "DEPARTURE-DATE"],
  callback: async (manager, ...args) => {
    if (noCurrentBooking()) return;
    let hasError = false;

    // Check if at least one passenger has been added
    const adults = booking.state.passengers.length;
    if (adults === 0) {
      manager.writeError("No passenger found!", true);
      manager.writeLine("Please add at least one passenger using 'booking passenger add'");
      hasError = true;
    }

    const [originLocationCode, destinationLocationCode, departureDate] = args;

    // Input validation
    const length = { min: 3, max: 3 };
    if (!isLength(originLocationCode, length) ||
      !isLength(destinationLocationCode, length) ||
      !isUppercase(originLocationCode) ||
      !isUppercase(destinationLocationCode)) {
      manager.writeError("Invalid origin or destination location code");
      manager.writeLine("Please enter three uppercase characters");
      manager.writeLine();
      hasError = true;
    }
    if (!isDate(departureDate)) {
      manager.writeError("Invalid date format: " + departureDate);
      manager.writeLine("Please enter the departure date in YYYY-MM-DD format");
      manager.writeLine();
      hasError = true;
    }
    if (isDate(departureDate) && !isAfter(departureDate)) {
      manager.writeError("Invalid date: " + departureDate);
      manager.writeLine("Please enter a departure date in the future");
      manager.writeLine();
      hasError = true;
    }
    if (hasError) return;

    // Get, print and save flight offers
    const requestConfig: AxiosRequestConfig = {
      params: {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults
      }
    };
    try {
      const apiResponse = await api.get("/flights", requestConfig);
      if (apiResponse.status !== 200) {
        printApiError(apiResponse);
        return;
      }
      const flightOffers = apiResponse.data.data;
      if (flightOffers.length == 0) return manager.writeError(`No flights found!`, true);

      manager.writeSuccess(`Found ${blue.bold(flightOffers.length)} flights`, true);
      await printFlightOffers(flightOffers);
      flights.actions.addFlightOffers(flightOffers);
    }
    catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
    }
  },
};
