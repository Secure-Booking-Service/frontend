import { ICommand, TerminalManager } from "../../..";
import { CreditCard } from '@secure-booking-service/common-types';
import { booking } from "@/overmind/booking";
import c from 'ansi-colors';

export function printCreditCard(creditCard: CreditCard, manager: TerminalManager, ): void {
  manager.writeLine(creditCard.holder.toUpperCase());
  manager.write(c.bold(creditCard.number.match(/.{1,4}/g)?.join(" ") ?? "FAILURE!"));
  manager.writeLine(" " + creditCard.expire);
}

export const listCommand: ICommand = {
  command: "ls",
  description: "List creditcard of booking",
  callback: async (manager) => {
    
    if (booking.state.creditCard === undefined) {
      manager.writeError("No credit card found!");
      return;
    }
    
    manager.writeLine("Printing credit card ...");
    manager.writeLine();
    printCreditCard(booking.state.creditCard!, manager)
  },
};
