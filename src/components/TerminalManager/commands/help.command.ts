import { ICommand } from "..";

export const helpCommand: ICommand = {
  command: "help",
  description: "Prints this help message.",
  callback: async (manager) => {
    manager.writeLine("All available commands:\r\n");
    const width =
      manager.Commands.reduce((longest, cmd) => {
        return longest.command.length >= cmd.command.length ? longest : cmd;
      }).command.length + 4;
    for (const cmd of manager.Commands) {
      manager.writeLine(
        cmd.command + " ".repeat(width - cmd.command.length) + cmd.description
      );
    }
  },
};
