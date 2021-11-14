import { ICommand } from "../..";

export const closeCommand: ICommand = {
  command: "close",
  description: "Send the booking to GDS",
  callback: async (manager) => {
    manager.write("booking close command")
  },
};
