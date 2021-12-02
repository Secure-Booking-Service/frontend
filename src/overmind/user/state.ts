export interface State {
  isLoggedIn: boolean,
  email: string
}

export const initalState: State = {
  isLoggedIn: false,
  email: ""
};

export const state: State = {
  ...initalState,
};
