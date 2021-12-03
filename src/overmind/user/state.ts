import { Roles } from "@secure-booking-service/common-types/Roles";

export interface State {
  isLoggedIn: boolean,
  email: string
  roles: Roles[]
}

export const initalState: State = {
  isLoggedIn: false,
  email: "",
  roles: []
};

export const state: State = {
  ...initalState,
};
