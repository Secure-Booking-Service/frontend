import { Context } from './config';


export function isLoggedIn({ state }: Context, email: string): void {
  state.isLoggedIn = true;
  state.email = email;
}

export function isLoggedOut({ state }: Context): void {
  state.isLoggedIn = false;
  state.email = "";
}

// Why doesn't it work the normal way via initialState?! :-(
export const onInitializeOvermind = ({state}: Context): void => {
  state.isLoggedIn = Boolean(sessionStorage.getItem('token'));
  state.email = "";
};
