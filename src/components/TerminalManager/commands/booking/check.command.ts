import { booking } from "@/overmind/booking";
import { ICommand } from "../..";
import { noCurrentBooking } from "./helpers";

export const checkCommand: ICommand = {
  command: "check",
  description: "Validate the booking to meet requirements",
  callback: async (manager) => {
    if (noCurrentBooking(manager)) return;
  
    manager.writeLine("Checking current booking ...");
    
    let errors = 0;
    if (booking.state.flights.length === 0) {
      manager.writeError("No flights selected! Use 'booking select'", true);
      errors++;
    }

    if (booking.state.passengers.length === 0) {
      manager.writeError("No passengers added! Use 'booking passenger add'", true)
      errors++;
    } 

    const underagedDate = new Date();
    underagedDate.setFullYear(underagedDate.getFullYear() - 13)
    const underagedPassengers = booking.state.passengers.filter(passenger => new Date(passenger.birthrate).getTime() <= underagedDate.getTime() );
    const fullagedPassengers = booking.state.passengers.filter(passenger => new Date(passenger.birthrate).getTime() > underagedDate.getTime() );

    if (underagedPassengers.length !== 0 && fullagedPassengers.length === 0) {
      manager.writeError(" Full-aged passenger missing! Underaged passenger can not travel alone!", true)
      errors++;
    }

    if (booking.state.creditCard === undefined) {
      manager.writeError("No credit card added! Use 'booking creditcard add'", true)
      errors++;
    }

    manager.writeLine("");

    if (errors > 0) {
      manager.writeError("Found " + errors + " errors!", false);
      manager.writeError("Check failed!", true)
      booking.actions.setValidationStatus(false);
    } else {
      manager.writeSuccess("Found " + errors + " errors!", false);
      manager.writeSuccess("Check was successfull!", true);
      booking.actions.setValidationStatus(true);
    }
  },
};
