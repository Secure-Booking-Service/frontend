import { ICommand } from "@/TerminalManager";
import { Roles } from "@secure-booking-service/common-types/Roles";
import { api } from "@/utils/ApiUtil";
import isEmail from "validator/lib/isEmail";
import isIn from "validator/lib/isIn";
import { printApiError } from "@/TerminalManager/commands/helper";
import { user } from "@/overmind/user";

export const removeCommand: ICommand = {
  command: "rm",
  description: "Remove a role from user",
  usage: ["EMAIL", "ROLE"],
  callback: async (manager, ...args) => {
    // Check if user has enough permissions
    if (!user.state.roles.includes(Roles.ADMIN))
      return manager.writeError("Unauthorized: You dont have the permission to remove user roles!");

    let errors = 0;
    const [email, role] = args;

    if (!isEmail(email)) {
      manager.writeError("Please enter a valid email address!");
      manager.writeLine();
      errors++;
    }

    if (!isIn(role, Object.values(Roles))) {
      manager.writeError("Unknown Role!");
      manager.writeLine("Allowed Roles:");
      Object.values(Roles).forEach(roleItem => manager.writeLine(" - " + roleItem));
      manager.writeLine();
      errors++;
    }

    try {
      if (errors > 0) throw manager.writeError(errors + " errors!", false);

      const payload = {
        addRoles: [],
        removeRoles: [role]
      };

      const apiReponse = await api.put('/user/' + email, payload);
      
      if (apiReponse.status !== 200) throw printApiError(apiReponse);
      
      manager.writeInfo("All changes will be applied at the next user login.", true);
      manager.writeSuccess("User updated successfully!", true);
    } catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
      }
            
      manager.writeError("User was not updated!", true);
    }
  },
};
