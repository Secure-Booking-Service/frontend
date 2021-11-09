import { ICommand } from "..";

export const clearCommand: ICommand = {
  command: "clear",
  description: "Too much text? This helps.",
  callback: async (manager) => {
    manager.clear();
  },
};
