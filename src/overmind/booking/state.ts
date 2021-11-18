import { Booking, Passenger } from "@secure-booking-service/common-types"

export interface State extends Partial<Booking> {
  passengers: Passenger[],
  flights: any[],
  wasSuccessfullyValidated: boolean;
  hasBookingStarted: boolean
}

export const initalState: State = {
  passengers: [],
  flights: [],
  creditCard: undefined,
  wasSuccessfullyValidated: false,
  hasBookingStarted: false
}

export const state: State = {
  ...initalState, 
}
