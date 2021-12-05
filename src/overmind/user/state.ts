import { Roles } from "@secure-booking-service/common-types/Roles";

export interface State {
  isLoggedIn: boolean,
  sessionLifetime: number,
  sessionLogoutTimerId: number | null,
  email: string,
  roles: Roles[]
}

export const initalState: State = {
  isLoggedIn: false,
  sessionLifetime: 0,
  sessionLogoutTimerId: null,
  email: "",
  roles: []
};

export const state: State = {
  ...initalState,
};
