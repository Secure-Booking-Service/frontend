import { ICommand } from "..";

export const manCommand: ICommand = {
  command: "man",
  description: "Opens the documentation page.",
  callback: async () => {
    return "Opening documentation page...\r\n";
  },
};
