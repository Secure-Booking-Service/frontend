import { user } from "@/overmind/user";
import { ICommand } from "@/TerminalManager";
import { api } from "@/utils/ApiUtil";
import { Roles } from "@secure-booking-service/common-types/Roles";
import { magenta, yellow } from "ansi-colors";
import { printApiError } from "../../helper";

export const addCommand: ICommand = {
  command: "add",
  description: "Create a registration token to add a new user",
  usage: [],
  callback: async (manager) => {
    // Check if user has enough permissions
    if (!user.state.roles.includes(Roles.ADMIN))
      return manager.writeError("Unauthorized: You dont have the permission to add an user!");

    try {
      const apiReponse = await api.post('/user/');

      if (apiReponse.status !== 201) throw printApiError(apiReponse);

      
      manager.writeLine(`Registration token:       ${yellow.bold(apiReponse.data.data.token)}`);
      manager.writeLine(`This token is valid for:  ${magenta.bold(apiReponse.data.data.lifetime)}`);
      manager.writeLine();
      manager.writeInfo("Use 'register EMAIL TOKEN' on the target device to complete the setup", true);
      manager.writeSuccess("Registration token created successfully", true);

    } catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
      
      manager.writeError("Registration token could not be created", true);
    }
  },
};
