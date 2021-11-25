import { Booking, CreditCard, FlightOffer, Passenger } from "@secure-booking-service/common-types"

export interface State extends Partial<Booking> {
  passengers: Passenger[],
  flightOffers: FlightOffer[],
  selectedFlightOffer: FlightOffer | undefined,
  creditCard: CreditCard | undefined,
  wasSuccessfullyValidated: boolean,
  hasBookingStarted: boolean
}

export const initalState: State = {
  passengers: [],
  flightOffers: [],
  selectedFlightOffer: undefined,
  creditCard: undefined,
  wasSuccessfullyValidated: false,
  hasBookingStarted: false
}

export const state: State = {
  ...initalState, 
}
