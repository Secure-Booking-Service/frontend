import { user } from "@/overmind/user";
import store from "@/store";
import { ICommand } from "..";

export const logoutCommand: ICommand = {
  command: "logout",
  description: "Ends your current user session",
  callback: async (manager) => {
    try {
      await store.dispatch("logout");
      user.actions.isLoggedOut();
      manager.writeLine("Logged out successfully! Have a nice day!");
    } catch {
      manager.writeError("You are not logged in!");
    }
  },
};
