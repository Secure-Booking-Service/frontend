import { booking } from "@/overmind/booking";
import { CreditCard } from "@secure-booking-service/common-types";
import isAscii from "validator/lib/isAscii";
import isCreditCard from "validator/lib/isCreditCard";
import { ICommand } from "../../..";
import { printCreditCard } from "./list.command";

export const addCommand: ICommand = {
  command: "add",
  description: "Add creditcard to booking",
  callback: async (manager, ...args) => {
    // current booking is validated in ./index.ts
    const usage = "Usage: [...] add FIRSTNAME LASTNAME NUMBER EXPIRE-DATE";
    let errors = 0;
  
    if (booking.state.creditCard !== undefined) {
      manager.writeError("A credit card was already added to booking! Use 'booking creditcard ls' to display the current credit card.");
      return;
    }

    if (args.length !== 4) {
      manager.writeError("Wrong number arguments! Expected 4 but got " + args.length);
      manager.writeLine(usage);
      return;
    }

    const [ firstName, lastName, number, expireDate] = args;  

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

    if (!isCreditCard(number)) {
      manager.writeError("Invalid credit card number: " + number);
      manager.writeLine("Please enter a valid credit card number!");
      manager.writeLine();
      errors++;
    }

    const validation = expireDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/)
    
    if (validation === null || validation!.length !== 3) {
      manager.writeError("Invalid format or date: " + expireDate);
      manager.writeLine("Please enter the date of expire in the MM/YY format");
      manager.writeLine();
      errors++;
    }

    if (errors > 0) {
      manager.writeError(errors + " errors!", false);
      manager.writeError("Credit card was not added!", true);
    } else {
      const card: CreditCard = {
        expire: expireDate,
        holder: firstName.toUpperCase() + " " + lastName.toUpperCase(),
        number,
      }

      const index = booking.actions.addCreditCard(card);
      printCreditCard(card, manager);
      manager.writeSuccess("Credit card added successfully!", true);
    }

  },
};
