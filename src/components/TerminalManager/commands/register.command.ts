import { ICommand } from "..";
import { apiErrorHandler } from "../apierrorhandler";
import { startRegistration } from "@simplewebauthn/browser";
import isEmail from "validator/lib/isEmail";
import isUUID from "validator/lib/isUUID";
import { printApiError } from "./helper";
import { api } from "@/components/utils/ApiUtil";
import { user } from "@/overmind/user";

export const registerCommand: ICommand = {
  command: "register",
  description: "Registers a new user with an email address and token",
  usage: ["EMAIL", "TOKEN"],
  callback: async (manager, ...args) => {

    const [email, token] = args;

    // Validate that it is a valid email address
    if (!isEmail(email))
      return manager.writeError("Please enter a valid email address!");

    // Validate that it is a valid token
    if (!isUUID(token, 4))
      return manager.writeError("Please enter a valid registration token!");

    manager.writeLine("Start registration for a new user with email: " + email);

    try {
      // 1. Get options from server
      const apiOptionsResponse = await api.get("/authentication/register", { params: { email, token }});
      if (apiOptionsResponse.status !== 200) return printApiError(apiOptionsResponse);
      const attestationOptions: any = apiOptionsResponse.data.data;

      // 2. Generate Keypair - Wait for WebAuthn
      const attestationResponse = await startRegistration(attestationOptions);

      // 3. Send response to server
      const apiTokenResponse = await api.post("/authentication/register", { email, token, attestationResponse });
      if (apiOptionsResponse.status !== 200) return printApiError(apiOptionsResponse);

      // 4. Successfully registered a new user!
      user.actions.setIsLoggedIn(apiTokenResponse.data.data);
      return manager.writeLine(
        "Registration was successful! You are now logged in as " + email
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.name == "AbortError") {
        return manager.writeError("Registration aborted!");
      }

      if (error instanceof Error && error.name == "InvalidStateError") {
        return manager.writeError("Authenticator invalid!");
      }

      if (
        (error as any)?.code !== undefined &&
        (error as any)?.error !== undefined
      ) {
        return apiErrorHandler(manager, error as any);
      }

      // Request failed locally - maybe no internet connection etc?
      return manager.writeError(
        "Something went wrong locally - Check internet?"
      );
    }
  },
};
