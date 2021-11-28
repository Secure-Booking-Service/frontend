import { FlightOffer } from "@secure-booking-service/common-types";

export interface State {
  flightOffers: FlightOffer[]
}

export const initalState: State = {
  flightOffers: []
};

export const state: State = {
  ...initalState,
};
