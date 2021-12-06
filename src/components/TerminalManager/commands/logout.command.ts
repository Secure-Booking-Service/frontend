import { user } from "@/overmind/user";
import { api } from "@/components/utils/ApiUtil";
import { ICommand } from "..";
import { apiErrorHandler } from "../apierrorhandler";
import { printApiError } from "./helper";

export const logoutCommand: ICommand = {
  command: "logout",
  loginRequired: true,
  description: "Ends your current user session",
  callback: async (manager) => {
    try {
      // 1. Get options from server
      const apiOptionsResponse = await api.get("/authentication/logout");
      if (apiOptionsResponse.status !== 200) return printApiError(apiOptionsResponse);

      // 2. Logged out successful!
      user.actions.setIsLoggedIn();
      return manager.writeSuccess("Logged out successfully! Have a nice day!", true);
    } catch (error: unknown) {
      if ((error as any)?.code !== undefined || (error as any)?.error !== undefined) 
        return apiErrorHandler(manager, error as any);

      // Request failed locally - maybe no internet connection etc?
      return manager.writeError(
        "Something went wrong locally - Check internet?"
      );
    }
  },
};
