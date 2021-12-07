import { FlightOffer } from "@secure-booking-service/common-types";
import { TerminalManager } from "@/TerminalManager";
import { blue, cyan, magenta, red, yellow } from "ansi-colors";

/**
 * Prints the given array of flight offers to the console
 * @param offers Array of flight offers to print
 */
export async function printFlightOffers(offers: FlightOffer[]): Promise<void> {
  const manager = TerminalManager.Instance;
  const question = "Next page?";
  let index = 0;
  manager.writeLine();
  while (index < offers.length) {
    printFlightOffer(offers[index], ++index);
    if (index % 3 === 0 && index < offers.length) {
      const answer = await manager.runUserQuery(question);
      if (answer === 'n') break;
    }
    if (index < offers.length)
      manager.writeLine(magenta("------------------------------------"));
  }
}

/**
 * Prints the given flight offer to the console
 * @param offer Flight offer to print
 * @param index The flight number to print
 */
export function printFlightOffer(offer: FlightOffer, index?: number): void {
  const manager = TerminalManager.Instance;
  if (index !== undefined)
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
}
