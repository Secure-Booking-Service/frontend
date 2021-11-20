import { Passenger } from "@secure-booking-service/common-types";
import { ICommand, TerminalManager } from "../../..";
import c from 'ansi-colors';
import { booking } from "@/overmind/booking";

export function printPassenger(index: number, passenger: Passenger, manager: TerminalManager): void {
  
  const printStatement: string[] = [
    c.bold.blue(index.toString() + "."),
    passenger.lastName.toUpperCase() + ",",
    passenger.firstName.toUpperCase(),
    passenger.birthrate,
    passenger.gender.toUpperCase(),
  ]

  manager.writeLine(printStatement.join(" "));
}

export const listCommand: ICommand = {
  command: "ls",
  description: "List all passangers of booking",
  callback: async (manager) => {
    // current booking is validated in ./index.ts
    
    if (booking.state.passengers.length === 0) {
      manager.writeError("Passenger list is empty!");
      return;
    }

    manager.writeLine("Printing all passengers:");
    manager.writeLine();

    booking.state.passengers.forEach((passenger, index) => {
      printPassenger(index + 1, passenger, manager);
    })
  },
};
