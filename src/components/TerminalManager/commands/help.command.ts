import { ICommand, TerminalManager } from "..";
import { table, TableUserConfig } from "table";

export const helpCommand: ICommand = {
  command: "help",
  description: "Prints this help message.",
  callback: async (manager) => {
    // Filter hidden commands
    const commands = manager.Commands.filter((cmd) => { return !cmd.hidden; });
    displayTableFor(commands, manager);
  },
};

export function displayTableFor(commands: ICommand[], manager: TerminalManager,): void {
  // Calculate max length of command and description of all commands
  // eslint-disable-next-line prefer-const
  let { commandLength, descriptionLength } = commands.reduce(
    (values, cmd) => {
      const newCommandLength = values.commandLength > cmd.command.length
        ? values.commandLength
        : cmd.command.length;
      const newDescriptionLength = values.descriptionLength > cmd.description.length
        ? values.descriptionLength
        : cmd.description.length;
      return {
        commandLength: newCommandLength,
        descriptionLength: newDescriptionLength,
      };
    },
    { commandLength: 0, descriptionLength: 0 }
  );
  if (descriptionLength + commandLength > manager.Cols) {
    // Table too big, resize description column to fit terminal window
    descriptionLength = manager.Cols - commandLength - 8;
  }
  const config: TableUserConfig = {
    columns: {
      0: { width: commandLength },
      1: { width: descriptionLength },
    },
    header: {
      alignment: "center",
      content: "All available commands",
    },
  };
  const data = commands.map((cmd) => [cmd.command, cmd.description]);
  const tableString = table(data, config).replaceAll("\n", "\r\n");
  manager.write(tableString);
}
