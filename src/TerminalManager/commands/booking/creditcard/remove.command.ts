import { booking } from "@/overmind/booking";
import { ICommand } from "@/TerminalManager";
import { printCreditCard } from "./list.command";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove creditcard from booking",
  callback: async (manager) => {
    // current booking is validated in ./index.ts

    if (booking.state.creditCard === undefined) {
      manager.writeError("No credit card found! ");
      return;
    }

    const question = "Are you sure to delete the credit card?";
    const answer = await manager.runUserQuery(question);
    if (answer === 'n') {
      manager.writeError("Credit card was not removed!", true);
      return;
    }

    const card = booking.actions.removeCreditCard();
    manager.writeLine();
    printCreditCard(card, manager);
    manager.writeSuccess("Credit card removed!", true);
  },
};
