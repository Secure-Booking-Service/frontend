import { TerminalManager } from ".";

export const apiErrorHandler = (
  manager: TerminalManager,
  apiResponse: { error: { message: string }[] }
): void => {
  return manager.writeError(
    "Error from server: " + apiResponse.error[0].message,
    false
  );
};
