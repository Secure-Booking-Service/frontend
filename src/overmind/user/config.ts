import { IContext } from 'overmind';
import { state } from './state';
import * as actions from './actions';
export const config = {
  state,
  actions
};

export type Context = IContext<typeof config>;
