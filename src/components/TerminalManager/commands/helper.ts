import { AxiosResponse } from "axios";
import { ICommand, TerminalManager } from "@/components/TerminalManager";
import { displayTableFor } from "./help.command";

export function shift(args: string[]): string[] {
  args.shift();
  return args;
}

export async function executeSubCommand(registeredCommands: ICommand[], args: string[]): Promise<boolean> {
  const manager = TerminalManager.Instance;
  const [ command ] = args;
  const shiftedArgs = shift(args);
  const exeCommands = registeredCommands.filter((item) => item.command === command.toLocaleLowerCase());
  
  // Return false if no command or too many commands are available 
  if (exeCommands.length !== 1) {
    manager.writeError("Unkown operation: " + command.toLocaleLowerCase());
    manager.writeLine("Available operations: ");
    displayTableFor(registeredCommands, manager);
    return false
  }

  const [ execCommand ] = exeCommands;

  // Validate length of arguments
  if (validateArguments(shiftedArgs, execCommand)) return false;

  // Execute command
  await execCommand.callback(manager, ...shiftedArgs);

  // Return true as one command were executed
  return true;
}

/**
 * Validates the given args array according to the expected length of the calling function.
 * Returns true, if the validation FAILED.
 * 
 * @param args Array of strings
 * @param expected Number of expected
 * @param usage String with the usage description
 * @returns {boolean} Validation has been failed?
 */
export function validateArguments(args: string[], command: ICommand): boolean {
  if (command.usage === undefined) return false;

  const expected: number = command.usage.length;
  const usage: string = "Usage: [...] " + command.command + " " + command.usage.map(i => i.toUpperCase()).join(" ");
  const manager = TerminalManager.Instance;
  
  if (args.length !== expected) {
    manager.writeError("Wrong number of arguments! Expected " + expected + " but got " + args.length);
    manager.writeLine(usage);
    return true; // validation failed
  }

  return false; // validation was successful
}

/**
 * Prints the error and possible details at the user console
 * @param apiResponse An axios response with a status code other than 2xx
 */
export function printApiError(apiResponse: AxiosResponse): void {
  const manager = TerminalManager.Instance;
  manager.writeError("Error: " + apiResponse.statusText);
  const errors = apiResponse.data.error;
  if (errors instanceof Array && errors.length !== 0) {
      manager.writeError("Details:");
      errors.forEach((err: any) => {
          manager.writeError("- " + err.message);
      });
  }
}