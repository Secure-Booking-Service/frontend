import { ICommand } from "..";
import { table, TableUserConfig } from "table";

export const helpCommand: ICommand = {
  command: "help",
  description: "Prints this help message.",
  callback: async (manager) => {
    // Calculate max length of command and description of all commands
    // eslint-disable-next-line prefer-const
    let { commandLength, descriptionLength } = manager.Commands.reduce(
      ({ commandLength, descriptionLength } /* NOSONAR*/, cmd) => {
        const newCommandLength =
          commandLength > cmd.command.length
            ? commandLength
            : cmd.command.length;
        const newDescriptionLength =
          descriptionLength > cmd.description.length
            ? descriptionLength
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
    const data = manager.Commands.map((cmd) => {
      return [cmd.command, cmd.description];
    });
    const tableString = table(data, config).replaceAll("\n", "\r\n");
    manager.write(tableString);
  },
};
