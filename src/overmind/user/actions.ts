import { Context } from './config';
import jwt_decode from "jwt-decode";
import { Roles } from '@secure-booking-service/common-types/Roles';

export function isLoggedIn({ state, actions }: Context, token: string | null): void {
  if (token) {
    const { data: { email: userEmail, roles: userRoles } } = jwt_decode(token) as any;
    state.isLoggedIn = true;
    state.email = userEmail;
    state.roles = userRoles as Roles[];
  }
  else {
    actions.isLoggedOut();
  }
}

export function isLoggedOut({ state }: Context): void {
  state.isLoggedIn = false;
  state.email = "";
  state.roles = [];
}

// Why doesn't it work the normal way via initialState?! :-(
export const onInitializeOvermind = ({ actions }: Context): void => {
  actions.isLoggedIn(sessionStorage.getItem('token'));
};
