import { ICommand } from "../..";

export const selectCommand: ICommand = {
  command: "select",
  description: "Select a flight",
  callback: async (manager) => {
    manager.write("booking select command");
  },
};
