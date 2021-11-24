import { ICommand } from "../..";

export const searchCommand: ICommand = {
  command: "search",
  description: "Search a flight",
  callback: async (manager) => {
    manager.write("flight search command");
  },
};
