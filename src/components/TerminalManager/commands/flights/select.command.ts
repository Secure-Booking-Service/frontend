import { ICommand } from "@/components/TerminalManager";

export const selectCommand: ICommand = {
  command: "select",
  description: "Select a flight",
  usage: ["FLIGHT-ID"],
  callback: async (manager) => {
    manager.write("flight select command");
  },
};
