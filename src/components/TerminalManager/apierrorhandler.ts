import { TerminalManager } from ".";

export const apiErrorHandler = (manager: TerminalManager, apiResponse?: any) => {
    return manager.writeError('Error from server: ' + apiResponse.error[0].message, false);
}
