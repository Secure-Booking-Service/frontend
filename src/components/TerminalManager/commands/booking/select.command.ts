import { ICommand } from "@/components/TerminalManager";

export const selectCommand: ICommand = {
  command: "select",
  description: "Select a flight",
  callback: async (manager) => {
    manager.write("booking select command");
  },
};
