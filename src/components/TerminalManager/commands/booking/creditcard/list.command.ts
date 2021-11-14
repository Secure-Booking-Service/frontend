import { ICommand } from "../../..";

export const listCommand: ICommand = {
  command: "ls",
  description: "List creditcard of booking",
  callback: async (manager, ...args) => {
    manager.write("booking creditcard ls command");
  },
};
