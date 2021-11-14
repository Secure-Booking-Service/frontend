import { ICommand } from "../../..";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove a passanger from booking",
  callback: async (manager, ...args) => {
    manager.write("booking passanger rm command");
  },
};
