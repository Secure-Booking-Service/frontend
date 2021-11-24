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

    if (errors > 0) {
      manager.writeError(errors + " errors!", false);
      manager.writeError("Role not added!", true);
    } else {

      try {

        const payload = {
          addRoles: [role],
          removeRoles: []
        }

        const apiReponse = await api.put('/user/' + email, payload);

        if (apiReponse.status === 200) {
          manager.writeSuccess("Role added successfully!", true);
        } else {
          manager.writeError("Fail: " + apiReponse.statusText);
          manager.writeLine("Response from server: " + apiReponse.data.error[0].message);
          manager.writeLine();
          manager.writeError("Role not added!", true);
        }

      } catch (error: unknown) {
        console.error("Unkown error!", error)
      }
    }
  },
};
