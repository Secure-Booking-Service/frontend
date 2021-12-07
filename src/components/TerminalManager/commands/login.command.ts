import { ICommand } from "..";
import isEmail from "validator/lib/isEmail";
import { startAuthentication } from "@simplewebauthn/browser";
import { apiErrorHandler } from "../apierrorhandler";
import { user } from "@/overmind/user";
import { api } from "@/components/utils/ApiUtil";
import { printApiError } from "./helper";

export const loginCommand: ICommand = {
  command: "login",
  description: "Login with email",
  callback: async (manager, email) => {
    // Validate that email address is provided
    if (email === undefined || email === "") {
      manager.writeError("Please provide an email address!");
      manager.writeLine("Usage: login EMAIL ");
      return;
    }

    // Validate that it is a valid email address
    if (!isEmail(email))
      return manager.writeError("Please enter a valid email address!");

    manager.writeLine(`Login ${email} ...`);

    try {
      // 1. Get options from server
      const apiOptionsResponse = await api.get("/authentication/login", { params: { email }});
      if (apiOptionsResponse.status !== 200) return printApiError(apiOptionsResponse);
      const assertionOptions: any = apiOptionsResponse.data.data;
      
      // 2. Solve challenge - Wait for WebAuthn
      const assertionResponse = await startAuthentication(assertionOptions);
    
      // 3. Send solved challenge to server
      const apiTokenResponse = await api.post("/authentication/login", { email, assertionResponse});
      if (apiTokenResponse.status !== 200) return printApiError(apiTokenResponse);

      // 4. Logged in successful!
      user.actions.setIsLoggedIn(apiTokenResponse.data.data);
      return manager.writeSuccess(`Successfully logged in as ${email}!`, true);
    } catch (error: unknown) {
      if (error instanceof Error && error.name == "AbortError") {
        return manager.writeError("Login aborted!");
      }

      if ((error as any)?.code !== undefined || (error as any)?.error !== undefined) 
        return apiErrorHandler(manager, error as any);

      // Request failed locally - maybe no internet connection etc?
      return manager.writeError(
        "Something went wrong locally - Check internet?"
      );
    }
  },
};
