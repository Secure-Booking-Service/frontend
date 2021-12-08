import { booking as currentBooking } from "@/overmind/booking";
import { TerminalManager } from "@/TerminalManager";
import { Booking } from "@secure-booking-service/common-types";
import { green, magenta, yellow } from "ansi-colors";
import { printPassenger } from "./passenger/list.command";
import { printCreditCard } from "./creditcard/list.command";
import { printFlightOffer } from "../flights/helpers";


/**
 * Checks if a new booking workflow has been started.
 * If not it prints an error message and returns true
 * 
 * @export
 * @return {boolean} booking has not been started
 */
export function noCurrentBooking(): boolean {
  const manager = TerminalManager.Instance;
  if (!currentBooking.state.hasBookingStarted) {
    manager.writeError("No booking found!");
    manager.writeLine("Use 'booking new' to start a new booking!");
    return true;
  }

  return false;
}

/**
 * Prints the given array of bookings to the console
 * @param bookings Array of bookings to print
 */
export async function printBookings(bookings: Booking[]): Promise<void> {
  const manager = TerminalManager.Instance;
  const question = "Next page?";
  manager.writeLine();
  let index = 0;
  while (index < bookings.length) {
    printBooking(bookings[index]);
    index++;
    if (index < bookings.length) {
      const answer = await manager.runUserQuery(question);
      if (answer === 'n') break;
    }
    if (index < bookings.length)
      manager.writeLine(magenta("------------------------------------"));
  }
}

/**
 * Prints the given booking to the console
 * @param booking Booking to print
 */
export function printBooking(booking: Booking): void {
  const manager = TerminalManager.Instance;
  manager.writeLine(`Booking id: ${yellow.bold(booking.id)}`);
  manager.writeLine(`Created by: ${green.bold(booking.createdBy)}`);
  manager.writeLine(`Created at: ${booking.createdAt}`);
  manager.writeLine(`From: ${booking.from}`);
  manager.writeLine(`To: ${booking.to}`);
  manager.writeLine();
  manager.writeLine("Passengers:");
  booking.passengers.forEach((passenger, index) => printPassenger(index + 1, passenger, manager));
  manager.writeLine();
  manager.writeLine("Creditcard:");
  printCreditCard(booking.creditCard, manager);
  manager.writeLine();
  manager.writeLine("Flight offer:");
  printFlightOffer(booking.flightOffer);
}
