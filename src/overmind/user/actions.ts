import { Context } from './config';


export function isLoggedIn({ state }: Context, email: string): void {
  state.isLoggedIn = true;
  state.email = email;
}

export function isLoggedOut({ state }: Context): void {
  state.isLoggedIn = false;
  state.email = "";
}
