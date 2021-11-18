import { Passenger } from '@secure-booking-service/common-types';
import { Context } from './config';

export function newBooking({ state }: Context): void {
  state.hasBookingStarted = true;
}
  
export function abortBooking({ state, actions }: Context): void {
  actions.newBooking();
  state.hasBookingStarted = false;
}

export function setValidationStatus({ state }: Context, successfull: boolean): void {
  state.wasSuccessfullyValidated = successfull;
}

export function resetValidationStatus({ state }: Context): void {
  state.wasSuccessfullyValidated = false;
}

export function addPassenger({ state, actions }: Context, passenger: Passenger): void {
  state.passengers.push(passenger);
  actions.resetValidationStatus();
}

export function removePassenger({ state, actions }: Context, index: number): Passenger {
  actions.resetValidationStatus();
  return state.passengers.splice(index-1, 1)[0];
}