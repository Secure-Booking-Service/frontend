import { Passenger } from '@secure-booking-service/common-types';
import { Context } from './config';

export function newBooking({ state }: Context): void {
  state.hasBookingStarted = true;
}
  
export function abortBooking({ state, actions }: Context): void {
    actions.newBooking();
    state.hasBookingStarted = false;
}

export function addPassenger({ state }: Context, passenger: Passenger): void {
    state.passengers.push(passenger);
}

export function removePassenger({ state }: Context, index: number): Passenger {
    return state.passengers.splice(index-1, 1)[0];
}