import { FlightOffer } from '@secure-booking-service/common-types';
import { Context } from './config';


export function addFlightOffers({ state }: Context, flightOffers: FlightOffer[]): void {
  state.flightOffers = flightOffers;
}

export function clearFlightOffers({ state }: Context): void {
  state.flightOffers = [];
}
