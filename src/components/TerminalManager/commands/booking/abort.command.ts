import { ICommand } from "../..";

export const newCommand: ICommand = {
  command: "abort",
  description: "Abort the current booking",
  callback: async (manager) => {
    manager.write("booking abort command")
  },
};
