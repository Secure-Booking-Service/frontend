import { CreditCard, Passenger } from "@secure-booking-service/common-types"

export type State = {
  passengers: Passenger[];
  flights: any[];
  creditCard: CreditCard | null;
  wasSuccessfullyValidated: boolean;
  hasBookingStarted: boolean
}

export const initalState: State = {
  passengers: [],
  flights: [],
  creditCard: null,
  wasSuccessfullyValidated: false,
  hasBookingStarted: false
}

export const state: State = {
  ...initalState, 
}
