import store from "@/store";
import { startRegistration } from "@simplewebauthn/browser";
import isEmail from "validator/lib/isEmail";
import isUUID from "validator/lib/isUUID";
import { ICommand } from "..";
import { apiErrorHandler } from "../apierrorhandler";

export const registerCommand: ICommand = {
  command: "register",
  description: "Registers a new user with an email adress and token",
  callback: async (manager, ...args) => {
    const USAGE = "Usage: register [EMAIL] [TOKEN]";

    if (args.length !== 2) {
      manager.writeError("Expected TWO arguments!");
      manager.writeLine(USAGE);
      return;
    }

    const [email, token] = args;

    // Validate that it is a valid email adress
    if (!isEmail(email))
      return manager.writeError("Please enter a valid email address!");

    // Validate that it is a valid token
    if (!isUUID(token, 4))
      return manager.writeError("Please enter a valid registration token!");

    manager.writeLine("Start registration for a new user with email: " + email);

    try {
      // 1. Get options from server
      const attestationOptions: any = await store.dispatch("startAttestation", {
        username: email,
        token,
      });

      // 2. Generate Keypair - Wait for WebAuthn
      const attestationResponse = await startRegistration(attestationOptions);

      // 3. Send reponse to server
      await store.dispatch("finishAttestation", {
        username: email,
        token,
        attestationResponse,
      });

      // 4. Successfully registered a new user!
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
        (error as any)?.code !== undefined ||
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
