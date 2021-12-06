import { Context } from './config';
import { Roles } from '@secure-booking-service/common-types/Roles';
import { TerminalManager } from '@/components/TerminalManager';
import { green } from 'ansi-colors';
import { api } from '@/components/utils/ApiUtil';
import { booking } from '../booking';

/**
 * If the data object is defined, it sets the user as logged in.
 *
 * @export
 * @param {Context} { state, actions } handled by overmind
 * @param {{ email: string, roles: Roles[], expiresIn: number }} data object from API
 */
export function setIsLoggedIn({ state, actions }: Context, data?: { email: string, roles: Roles[], expiresIn: number }): void {
  if (data === undefined || data.email === undefined) return actions.clear();
  state.isLoggedIn = true;
  actions.prepareUser(data);
  TerminalManager.Instance.Prompt = `${green.bold(state.email)} $ `;
}

/**
 * Clears the state and resets every attribute
 */
export function clear({ state }: Context): void {
  state.isLoggedIn = false;
  state.email = "";
  state.roles = [];
  TerminalManager.Instance.Prompt = `$ `;
  if (state.sessionLogoutTimerId) {
    clearTimeout(state.sessionLogoutTimerId);
    state.sessionLogoutTimerId = null;
  }

  booking.actions.abortBooking();
}

export function prepareUser({ state, actions }: Context,  data: { email: string, roles: Roles[], expiresIn: number }): void {
  // Save data
  state.email = data.email;
  state.roles = data.roles;

  // Clear old logout timer if existing
  if (state.sessionLogoutTimerId) clearTimeout(state.sessionLogoutTimerId);

  // Create new logout timer
  state.sessionLogoutTimerId = setTimeout(() => {
    actions.clear();
    TerminalManager.Instance.printLogoutMessage();
  }, data.expiresIn);
}

export async function initialize({ actions }: Context): Promise<void> {
  try {
    const apiReponse = await api.get("/authentication/verify");
    if (apiReponse.status !== 200) return;
    actions.setIsLoggedIn(apiReponse.data.data);
  } catch (error: unknown) {
    return;
  }
}
