import { ICommand } from "../../..";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove creditcard from booking",
  callback: async (manager, ...args) => {
    manager.write("booking creditcard rm command")
  },
};
