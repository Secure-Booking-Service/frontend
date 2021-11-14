import { ICommand } from "../../..";

export const addCommand: ICommand = {
  command: "add",
  description: "Add creditcard to booking",
  callback: async (manager, ...args) => {
    manager.write("booking creditcard add command");
  },
};
