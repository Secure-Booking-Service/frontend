import { booking } from "@/overmind/booking";
import { TerminalManager } from "@/components/TerminalManager";


/**
 * Checks if a new booking workflow has been started.
 * If not it prints an error message and returns true
 * 
 * @export
 * @param {TerminalManager} manager Terminal Manager instance
 * @return {boolean} booking has not been started
 */
export function noCurrentBooking(manager: TerminalManager): boolean {
  if (!booking.state.hasBookingStarted) {
    manager.writeError("No booking found!")
    manager.writeLine("Use 'booking new' to start a new booking!");
    return true;
  }

  return false;
}
