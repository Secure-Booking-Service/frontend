import { ICommand, TerminalManager } from "..";
import { displayTableFor } from "./help.command";

export function shift(args: string[]): string[] {
  args.shift();
  return args;
}

export async function executeSubCommand(registeredCommands: ICommand[], manager: TerminalManager, args: string[]): Promise<boolean> {
  const [ command ] = args;
  const exeCommand = registeredCommands.filter((item) => item.command === command.toLocaleLowerCase());
  
  // Return false if no command or too many commands are available 
  if (exeCommand.length !== 1) {
    manager.writeError("Unkown operation: " + command.toLocaleLowerCase());
    manager.writeLine("Available operations: ");
    displayTableFor(registeredCommands, manager);
    return false
  }
  
  // Execute command
  await exeCommand[0].callback(manager, ...shift(args));

  // Return true as one command were executed
  return true;
}

/**
 * Validates the given args array according to the expected length of the calling function.
 * Retruns true, if the validation FAILED.
 * 
 * @param args Array of strings
 * @param expected Number of expected
 * @param usage String with the usage description
 * @returns {boolean} Validation has been failed?
 */
export function validateArguments(args: string[], expected: number, usage: string): boolean {
  const manager = TerminalManager.Instance;
  if (args.length !== expected) {
    manager.writeError("Wrong number of arguments! Expected " + expected + " but got " + args.length);
    manager.writeLine(usage);
    return true; // validation failed
  }

  return false; // validation was successful
}
