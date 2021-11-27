import { FlightOffer } from "@secure-booking-service/common-types";
import { TerminalManager } from "@/components/TerminalManager";
import { blue, cyan, red, yellow } from "ansi-colors";

/**
 * Prints the given array of flight offers to the console
 * @param offers Array of flight offers to print
 */
 export function printFlightOffers(offers: FlightOffer[]): void {
    const manager = TerminalManager.Instance;
    manager.writeLine();
    offers.forEach((offer, index) => {
        printFlightOffer(offer, index + 1);
    });
}

/**
 * Prints the given flight offer to the console
 * @param offer Flight offer to print
 */
 export function printFlightOffer(offer: FlightOffer, index: number): void {
    const manager = TerminalManager.Instance;
    manager.writeLine(`Flight number: ${blue.bold(String(index))}`);
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
    manager.writeLine();
}
