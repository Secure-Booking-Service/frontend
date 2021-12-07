import { Roles } from "@secure-booking-service/common-types/Roles";

export interface State {
  isLoggedIn: boolean,
  sessionLogoutTimerId: NodeJS.Timeout | null,
  email: string,
  roles: Roles[]
}

export const initalState: State = {
  isLoggedIn: false,
  sessionLogoutTimerId: null,
  email: "",
  roles: []
};

export const state: State = {
  ...initalState,
};
