import { booking } from "@/overmind/booking";
import { ICommand } from "@/components/TerminalManager";
import { printCreditCard } from "./list.command";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove creditcard from booking",
  callback: async (manager, ...args) => {
    // current booking is validated in ./index.ts

    if (booking.state.creditCard === undefined) {
      manager.writeError("No credit card found! ");
      return;
    }

    if (!args.includes('-f')) {
      manager.writeLine("Are you sure to delete the credit card?")
      manager.writeLine("Use 'booking creditcard rm -f' to remove the credit card!")
      manager.writeError("Credit card was not removed!", true)
      return;
    }

    const card = booking.actions.removeCreditCard();
    manager.writeLine();
    printCreditCard(card, manager);
    manager.writeError("Credit card removed!", true);

  },
};
