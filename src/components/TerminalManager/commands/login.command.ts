import { ICommand } from "..";
import isEmail from 'validator/lib/isEmail';
import store from '../../../store';
import { startAuthentication } from "@simplewebauthn/browser";
import { apiErrorHandler } from "../apierrorhandler";


export const loginCommand: ICommand = {
  command: 'login',
  description: 'Login with e-mail',
  callback: async (manager, email) => {

    // Validate that email adress is provided
    if (email === undefined || email === "") {
      manager.writeError("Please provide an email adress!", false);
      manager.writeLine("Usage: login EMAIL ");
      //yreturn;
    }

    // Validate that it is an valid email adress
    if (!isEmail(email)) return manager.writeError('Please enter a valid email adress!', false);
    manager.writeLine(`Login ${email} ...`);
  
    try {
      // 1. Get challenge from server
      const assertionOptions: any = await store.dispatch('startAssertion', email)

      // 2. Solve challenge - Wait for WebAuthn
      const assertionResponse = await startAuthentication(assertionOptions);

      // 3. Send solved challenge to server
      await store.dispatch("finishAssertion", { username: email, assertionResponse })

      // 4. Logged in successful!
      return manager.writeLine(`Successfully logged in as ${email}!`);

    } catch (error: unknown) {
      if (error instanceof Error && error.name == "AbortError") {
        return manager.writeError("Login aborted!", false);
      }

      if ((error as any).code !== undefined || (error as any).error !== undefined) {
        return apiErrorHandler(manager, error)
      }

      // Request failed locally - maybe no internet connection etc?
      return manager.writeError('Something went wrong locally - Check internet?', false);  
    }
  }
}