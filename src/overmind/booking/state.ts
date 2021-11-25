import { Booking, CreditCard, Passenger } from "@secure-booking-service/common-types"

export interface State extends Partial<Booking> {
  passengers: Passenger[],
  creditCard: CreditCard | undefined,
  wasSuccessfullyValidated: boolean,
  hasBookingStarted: boolean
}

export const initalState: State = {
  passengers: [],
  flightOffer: undefined,
  creditCard: undefined,
  wasSuccessfullyValidated: false,
  hasBookingStarted: false
}

export const state: State = {
  ...initalState, 
}
