import { ICommand } from "../../..";

export const listCommand: ICommand = {
  command: "ls",
  description: "List all passangers of booking",
  callback: async (manager, ...args) => {
    manager.write("booking passanger ls command");
  },
};
