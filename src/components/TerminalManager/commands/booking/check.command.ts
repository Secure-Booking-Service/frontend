import { booking } from "@/overmind/booking";
import { ICommand } from "@/components/TerminalManager";
import { printCreditCard } from "./creditcard/list.command";
import { noCurrentBooking } from "./helpers";
import { printPassenger } from "./passenger/list.command";
import { printFlightOffer } from "../flights/helpers";

export const checkCommand: ICommand = {
  command: "check",
  description: "Validate the booking to meet requirements",
  callback: async (manager) => {
    if (noCurrentBooking()) return;
  
    manager.writeLine("Checking current booking ...");
    manager.writeLine();
    
    let errors = 0;
    if (booking.state.flightOffer === undefined) {
      manager.writeError("No flights selected! Use 'flight select'", true);
      errors++;
    } else {
      manager.writeLine("Flight offer:");
      printFlightOffer(booking.state.flightOffer);
      manager.writeLine();
    }

    if (booking.state.passengers.length === 0) {
      manager.writeError("No passengers added! Use 'booking passenger add'", true);
      errors++;
    } else {
      manager.writeLine("Passenger(s):");
      booking.state.passengers.forEach((passenger, index) => {
        printPassenger(index + 1, passenger, manager);
      });
    }

    const underagedDate = new Date();
    underagedDate.setFullYear(underagedDate.getFullYear() - 13);
    const underagedPassengers = booking.state.passengers.filter(passenger => new Date(passenger.dateOfBirth).getTime() > underagedDate.getTime() );
    const fullagedPassengers = booking.state.passengers.filter(passenger => new Date(passenger.dateOfBirth).getTime() <= underagedDate.getTime() );
    
    if (underagedPassengers.length !== 0 && fullagedPassengers.length === 0) {
      manager.writeError("Full-aged passenger missing! Underaged passenger can not travel alone!", true);
      errors++;
    }
    manager.writeLine();
    
    if (booking.state.creditCard === undefined) {
      manager.writeError("No credit card added! Use 'booking creditcard add'", true);
      errors++;
    } else {
      manager.writeLine("Credit card:");
      printCreditCard(booking.state.creditCard, manager);
    }

    manager.writeLine();

    if (errors > 0) {
      manager.writeError("Found " + errors + " errors!", false);
      manager.writeError("Check failed!", true);
      booking.actions.setValidationStatus(false);
    } else {
      manager.writeSuccess("No errors found!", false);
      manager.writeSuccess("Check was successfull!", true);
      booking.actions.setValidationStatus(true);
    }
  },
};
