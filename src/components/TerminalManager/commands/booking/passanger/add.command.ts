import { ICommand } from "../../..";

export const addCommand: ICommand = {
  command: "add",
  description: "Add a new passanger to booking",
  callback: async (manager, ...args) => {
    manager.write("booking passanger add command")
  },
};
