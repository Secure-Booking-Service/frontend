import { ICommand } from "../..";

export const checkCommand: ICommand = {
  command: "check",
  description: "Validate the booking to meet requirements",
  callback: async (manager) => {
    manager.write("booking check command")
  },
};
