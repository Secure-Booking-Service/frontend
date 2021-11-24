import { ICommand } from "../..";

export const searchCommand: ICommand = {
  command: "search",
  description: "Search a flight",
  usage: ["ORIGIN", "DESTINATION", "DEPARTURE-DATE"],
  callback: async (manager) => {
    manager.write("flight search command");
  },
};
