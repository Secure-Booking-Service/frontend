import { ICommand } from "@/components/TerminalManager";
import { Roles } from "@secure-booking-service/common-types/Roles";
import { api } from "@/store/utils/ApiUtil";
import isEmail from "validator/lib/isEmail";
import isIn from "validator/lib/isIn";

export const addCommand: ICommand = {
  command: "add",
  description: "Add a role to user",
  usage: ["EMAIL", "ROLE"],
  callback: async (manager, ...args) => {

    let errors = 0;

    const [email, role] = args;

    if (!isEmail(email)) {
      manager.writeError("Please enter a valid email address!")
      manager.writeLine();
      errors++;
    }

    if (!isIn(role, Object.values(Roles))) {
      manager.writeError("Unknown Role!");
      manager.writeLine("Allowed Roles:");
      Object.values(Roles).forEach(role => manager.writeLine(" - " + role));
      manager.writeLine();
      errors++;
    }

    try {
      if (errors > 0) throw manager.writeError(errors + " errors!", false);

      const payload = {
        addRoles: [role],
        removeRoles: []
      }

      const apiReponse = await api.put('/user/' + email, payload);
      
      if (apiReponse.status !== 200) {
        // TODO: Refactor after Antons PR
        manager.writeError("Fail: " + apiReponse.statusText);
        manager.writeLine("Response from server: " + apiReponse.data.error[0].message);
        manager.writeLine();
        throw undefined;
      }
      
      manager.writeSuccess("User updated successfully!", true);
    } catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
      
      manager.writeError("User was not updated!", true);
    }
  },
};
