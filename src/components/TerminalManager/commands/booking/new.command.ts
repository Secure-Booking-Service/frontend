import { ICommand } from "../..";

export const newCommand: ICommand = {
  command: "new",
  description: "Start a new booking process",
  callback: async (manager) => {
    manager.write("booking new command");
  },
};
