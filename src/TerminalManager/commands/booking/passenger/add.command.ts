import { ICommand } from "@/TerminalManager";
import isAscii from 'validator/lib/isAscii';
import isDate from 'validator/lib/isDate';
import { Passenger } from "@secure-booking-service/common-types";
import { booking } from "@/overmind/booking";
import { printPassenger } from "./list.command";

export const addCommand: ICommand = {
  command: "add",
  description: "Add a new passanger to booking",
  usage: ["FIRSTNAME", "LASTNAME", "YYYY-MM-DD", "GENDER"],
  callback: async (manager, ...args) => {
    // current booking is validated in ./index.ts
    let errors = 0;
    
    const [ firstName, lastName, dateOfBirth, gender] = args;  

    if (!isAscii(firstName)) {
      manager.writeError("First name is NOT ASCII compliant!");
      manager.writeLine();
      errors++;
    }

    if (!isAscii(lastName)) {
      manager.writeError("Last name is NOT ASCII compliant!");
      manager.writeLine();
      errors++;
    }

    if (!isDate(dateOfBirth)) {
      manager.writeError("Invalid format: " + dateOfBirth);
      manager.writeLine("Please enter the birthdate in the YYYY-MM-DD format");
      manager.writeLine();
      errors++;
    }

    const allowedGenderValues = ["M", "W", "D"];
    if (gender.length !== 1 || !allowedGenderValues.includes(gender.toUpperCase())) {
      manager.writeError("Gender '" + gender + "' not allowed!");
      manager.writeLine("Allowed values: '" + allowedGenderValues.join(', ') + "'");
      manager.writeLine();
      errors++;
    }

    if (errors > 0) {
      manager.writeError(errors + " errors!", false);
      manager.writeError("Passenger not added!", true);
      return;
    }
    
    const passenger: Passenger = {
      firstName: firstName.toUpperCase(),
      lastName: lastName.toUpperCase(),
      dateOfBirth,
      gender: gender.toUpperCase()
    };

    const index = booking.actions.addPassenger(passenger);
    printPassenger(index, passenger, manager);
    manager.writeSuccess("Passenger added successfully!", true);
  },
};
