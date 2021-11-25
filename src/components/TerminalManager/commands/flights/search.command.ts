import { AxiosRequestConfig } from "axios";
import { ICommand, TerminalManager } from "../..";
import { api } from "../../../../store/utils/ApiUtil";
import { booking } from "@/overmind/booking";
import { noCurrentBooking } from "../booking/helpers";
import { printApiError } from "../helper";
import { FlightOffer } from "@secure-booking-service/common-types";
import { blue, cyan, red, yellow } from "ansi-colors";

export const searchCommand: ICommand = {
    command: "search",
    description: "Search a flight",
    usage: ["ORIGIN", "DESTINATION", "DEPARTURE-DATE"],
    callback: async (manager, ...args) => {
        if (noCurrentBooking()) return;
        const adults = booking.state.passengers.length
        if (adults === 0) {
            manager.writeError("No Passenger found!", true);
            manager.writeLine("Please add at least one passenger using 'booking passenger add'")
            return;
        }
        const [originLocationCode, destinationLocationCode, departureDate] = args;
        // TODO: Input Validation
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
