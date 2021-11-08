/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/explicit-module-boundary-types: 0  */

export interface IStore {
  data: any;
  status: {
    pending: boolean;
    success: boolean;
    fail: boolean;
    error?: Error;
  };
}

export default class StoreUtil {
  /**
   * init the state.
   * @return {Object} default state
   */
  static state(data?: any): IStore {
    return {
      data,
      status: {
        pending: false,
        success: false,
        fail: false,
        error: undefined,
      },
    };
  }

  /**
   * @param {Object} state - the state to update
   * @param {Object,Error} data - data to update with
   * @returns {Object} state after update
   */
  static updateState(state: IStore, data: any = undefined): IStore {
    if (!state) throw new Error("state object is missing");

    if (data === undefined) {
      // PENDING
      return this._mutationPending({ ...state });
    }

    if (data === null) {
      // RESET
      return this.state();
    }

    // SUCCESS or FAIL
    return data instanceof Error
      ? this._mutationFail({ ...state }, data)
      : this._mutationSuccess({ ...state }, data);
  }

  /**
   * Unlocks state and clears error depending on success parameter
   * @param {Object} state - the state to update
   * @param {Boolean} success - set to success state and clear error
   * @returns {Object} state after update
   */
  static unlockState(state: IStore, success: boolean): IStore {
    return this._mutationUnlock({ ...state }, success);
  }

  /**
   * Locks state without resetting stored data
   * @param {Object} state - the state to update
   * @returns {Object} state after update
   */
  static lockState(state: IStore): IStore {
    return this._mutationLock({ ...state });
  }

  /**
   * @param {Object} state - the state to be unlocked
   * @param {Boolean} success - set to success state
   * @returns {Object} updated state
   */
  static _mutationUnlock(state: IStore, success: boolean): IStore {
    state.status.pending = false;
    state.status.success = success;
    state.status.fail = !success;
    if (!success) state.status.error = undefined;
    return state;
  }

  /**
   * @param {Object} state - the state to be locked
   * @returns {Object} updated state
   */
  static _mutationLock(state: IStore): IStore {
    state.status.pending = true;
    state.status.success = false;
    state.status.fail = false;
    return state;
  }

  /**
   * @param {Object} state - the status to be put in pending state
   * @returns {Object} updated state
   */
  static _mutationPending(state: IStore): IStore {
    state.data = null;
    state.status.pending = true;
    state.status.success = false;
    state.status.fail = false;
    state.status.error = undefined;
    return state;
  }

  /**
   * @param {Object} state - the status to be put in success state
   * @param {Object,array} - data to update with
   * @returns {Object} updated state
   */
  static _mutationSuccess(state: IStore, data: any): IStore {
    state.data = data instanceof Array ? data : [data];
    state.status.pending = false;
    state.status.success = true;
    state.status.fail = false;
    state.status.error = undefined;
    return state;
  }

  /**
   * @param {Object} state - the status to be put in success state
   * @param {Object,array} - data to update with
   * @returns {object} updated state
   */
  static _mutationFail(state: IStore, data: any): IStore {
    state.data = null;
    state.status.pending = false;
    state.status.success = false;
    state.status.fail = true;
    state.status.error = data;
    return state;
  }
}
