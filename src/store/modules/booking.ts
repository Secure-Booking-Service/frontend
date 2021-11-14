import StoreUtil from "../utils/StoreUtil";

// Restore booking in case page has to be reloaded
const bookingDraft = sessionStorage.getItem("booking_draft");

export default {
  state: () => ({
    booking: StoreUtil.state(bookingDraft || null),
  }),
  mutations: {
    SET_BOOKING(state: any, payload: any) {
      state.auth = StoreUtil.updateState(state.booking, payload);
    },
  },
  action: {},
  getters: {
    
  },  
}