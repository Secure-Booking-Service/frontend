import { AxiosRequestConfig } from "axios";
import { ICommand, TerminalManager } from "../..";
import { api } from "../../../../store/utils/ApiUtil";
import { booking } from "@/overmind/booking";
import { noCurrentBooking } from "../booking/helpers";
import { printApiError } from "../helper";
import { FlightOffer } from "@secure-booking-service/common-types";
import { blue, cyan, red, yellow } from "ansi-colors";
import isDate from 'validator/lib/isDate';
import isAfter from 'validator/lib/isAfter';
import isUppercase from 'validator/lib/isUppercase';
import isLength from 'validator/lib/isLength';
import { flights } from "@/overmind/flights";

export const searchCommand: ICommand = {
    command: "search",
    description: "Search a flight",
    usage: ["ORIGIN-CODE", "DESTINATION-CODE", "DEPARTURE-DATE"],
    callback: async (manager, ...args) => {
        if (noCurrentBooking()) return;
        let errors = false;

        // Check if at least one passenger has been added
        const adults = booking.state.passengers.length
        if (adults === 0) {
            manager.writeError("No Passenger found!", true);
            manager.writeLine("Please add at least one passenger using 'booking passenger add'")
            errors = true;
        }

        const [originLocationCode, destinationLocationCode, departureDate] = args;

        // Input validation
        const length = { min: 3, max: 3 }
        if (!isLength(originLocationCode, length) ||
            !isLength(destinationLocationCode, length) ||
            !isUppercase(originLocationCode) ||
            !isUppercase(destinationLocationCode)) {
            manager.writeError("Invalid origin or destination location code");
            manager.writeLine("Please enter three uppercase characters");
            manager.writeLine();
            errors = true;
        }
        if (!isDate(departureDate)) {
            manager.writeError("Invalid date format: " + departureDate);
            manager.writeLine("Please enter the departure date in YYYY-MM-DD format");
            manager.writeLine();
            errors = true;
        }
        if (isDate(departureDate) && !isAfter(departureDate)) {
            manager.writeError("Invalid date: " + departureDate);
            manager.writeLine("Please enter a departure date in the future");
            manager.writeLine();
            errors = true;
        }
        if (errors) return;

        // Get, print and save flight offers
        const requestConfig: AxiosRequestConfig = {
            params: {
                originLocationCode,
                destinationLocationCode,
                departureDate,
                adults
            }
        }
        try {
            const apiResponse = await api.get("/flights", requestConfig)
            if (apiResponse.status === 200) {
                const flightOffers = apiResponse.data.data;
                printFlightOffers(flightOffers, manager);
                flights.actions.addFlightOffers(flightOffers);
            } else {
                printApiError(apiResponse);
            }
        }
        catch (error: unknown) {
            manager.writeError("Error: " + error)
        }
    },
};

/**
 * Prints the given array of flight offers to the console
 * @param offers Array of flight offers to print
 * @param manager Instace of terminal manager
 */
function printFlightOffers(offers: FlightOffer[], manager: TerminalManager): void {
    if (offers.length > 0)
        manager.writeSuccess(`Found ${offers.length} flights`, true);
    else
        manager.writeError(`No flights found!`, true);

    manager.writeLine("");
    offers.forEach((offer, index) => {
        manager.writeLine(`Flight number: ${blue.bold(String(index + 1))}`);
        manager.writeLine(`Bookable seats: ${offer.numberOfBookableSeats}`);
        manager.writeLine(`Stops: ${offer.stops}`);
        manager.writeLine(`Price: ${offer.price} ${offer.currency}`);
        manager.writeLine("Itinaries:");
        offer.flights.forEach(flight => {
            const departureDate = new Date(flight.departure.at).toUTCString().substr(0, 16);
            const departureTime = new Date(flight.departure.at).toUTCString().substr(17, 5) + " GMT";
            const arrivalDate = new Date(flight.arrival.at).toUTCString().substr(0, 16);
            const arrivalTime = new Date(flight.arrival.at).toUTCString().substr(17, 5) + " GMT";
            manager.write(`\t${yellow.bold(flight.departure.iataCode)}`);
            manager.write(` on ${departureDate} ${cyan.bold(departureTime)}`);
            manager.write(` ${red.bold('→')} ${yellow.bold(flight.arrival.iataCode)}`);
            manager.write(` on ${arrivalDate} ${cyan.bold(arrivalTime)}`);
            manager.write(` (${flight.duration.substr(2)})\r\n`);
        });
        manager.writeLine("");
    });
}
