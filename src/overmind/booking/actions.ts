import { CreditCard, Passenger } from '@secure-booking-service/common-types';
import { Context } from './config';

export function newBooking({ state }: Context): void {
  state.creditCard = undefined;
  state.passengers = [];
  state.hasBookingStarted = true;
}
  
export function abortBooking({ state, actions }: Context): void {
  actions.newBooking();
  state.hasBookingStarted = false;
}

export function setValidationStatus({ state }: Context, successful: boolean): void {
  state.wasSuccessfullyValidated = successful;
}

export function resetValidationStatus({ state }: Context): void {
  state.wasSuccessfullyValidated = false;
}

export function addPassenger({ state, actions }: Context, passenger: Passenger): number {
  const index = state.passengers.push(passenger);
  actions.resetValidationStatus();
  return index;
}

export function removePassenger({ state, actions }: Context, index: number): Passenger {
  actions.resetValidationStatus();
  return state.passengers.splice(index-1, 1)[0];
}

export function addCreditCard({ state, actions }: Context, card: CreditCard): void {
  actions.resetValidationStatus();
  state.creditCard = card;
}

export function removeCreditCard({ state, actions }: Context): CreditCard {
  actions.resetValidationStatus();
  
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const card = state.creditCard!;
  state.creditCard = undefined;
  
  return card;
}
