import { Context } from './config';
import jwt_decode from "jwt-decode";
import { Roles } from '@secure-booking-service/common-types/Roles';
import { TerminalManager } from '@/components/TerminalManager';
import { green } from 'ansi-colors';
import store from '@/store';

export function isLoggedIn({ state, actions }: Context, token: string | null): void {
  if (token) {
    actions.updateDataFromToken(token);
    TerminalManager.Instance.Prompt = `${green.bold(state.email)} $ `;
  }
  else {
    actions.isLoggedOut();
  }
}

export function isLoggedOut({ state }: Context): void {
  state.isLoggedIn = false;
  state.email = "";
  state.roles = [];
  state.sessionLifetime = 0;
  TerminalManager.Instance.Prompt = `$ `;
  if (state.sessionLogoutTimerId) {
    clearTimeout(state.sessionLogoutTimerId);
    state.sessionLogoutTimerId = null;
  }
}

export function updateDataFromToken({ state, actions }: Context, token: string): void {
  // Get data from jwt token
  const { data: { email: userEmail, roles: userRoles }, exp: expiration } = jwt_decode(token) as any;

  // Save data
  const sessionLifetime = expiration * 1000 - Date.now();
  state.isLoggedIn = true;
  state.sessionLifetime = sessionLifetime > 0 ? sessionLifetime : 0;
  state.email = userEmail;
  state.roles = userRoles as Roles[];

  // Create new logout timer (clear old one if existing)
  if (state.sessionLogoutTimerId)
    clearTimeout(state.sessionLogoutTimerId);
  state.sessionLogoutTimerId = setTimeout(() => {
    store.dispatch("logout");
    actions.isLoggedOut();
    TerminalManager.Instance.printLogoutMessage();
  }, sessionLifetime);
}

// Why doesn't it work the normal way via initialState?! :-(
export const onInitializeOvermind = ({ actions }: Context): void => {
  const token = sessionStorage.getItem('token');
  if (token !== null)
    actions.updateDataFromToken(token);
};
