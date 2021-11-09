import store from "@/store";
import { ICommand } from "..";

export const logoutCommand: ICommand = {
  command: "logout",
  description: "End your current user session",
  callback: async (manager) => {
    await store.dispatch("logout");
    manager.writeLine("Logged out successfully! Have a nice day!");
  },
};
