import { createStore } from "vuex";
import { api } from "./utils/ApiUtil";
import StoreUtil from "./utils/StoreUtil";

const token = sessionStorage.getItem("token");
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

export default createStore({
  state: {
    auth: StoreUtil.state(token || null),
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.auth = StoreUtil.updateState(state.auth, payload);
    },
  },
  actions: {
    verifyToken(context) {
      // if (!context.getters.isLoggedIn) return Promise.resolve();

      context.commit("SET_AUTH");
      return new Promise<void>((resolve, reject) => {
        api
          .post("/verify")
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === "success") {
              context.commit("SET_AUTH", token);
              resolve();
            } else {
              context.commit("SET_AUTH", apiResponse.error[0].message);
              context.dispatch("logout");
              reject();
            }
          })
          .catch((err: Error) => {
            context.commit("SET_AUTH", err);
            context.dispatch("logout");
            reject();
          });
      });
    },

    startAttestation({ commit }, formData) {
      commit("SET_AUTH");
      return new Promise<void>((resolve, reject) => {
        api
          .get("/authentication/register", { params: formData })
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === "success") {
              commit("SET_AUTH", null);
              resolve(apiResponse.data);
            } else {
              commit("SET_AUTH", new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit("SET_AUTH", new Error());
            reject();
          });
      });
    },

    finishAttestation({ commit }, payload) {
      commit("SET_AUTH");
      return new Promise<void>((resolve, reject) => {
        api
          .post("/authentication/register", payload)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === "success") {
              const jwt = apiResponse.data.accesstoken;
              api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
              sessionStorage.setItem("token", jwt);
              commit("SET_AUTH", jwt);
              resolve();
            } else {
              commit("SET_AUTH", new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit("SET_AUTH", new Error());
            reject();
          });
      });
    },

    startAssertion({ commit }, username) {
      commit("SET_AUTH");
      return new Promise<void>((resolve, reject) => {
        api
          .get("/authentication/login", { params: { username } })
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === "success") {
              commit("SET_AUTH", null);
              resolve(apiResponse.data);
            } else {
              commit("SET_AUTH", new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit("SET_AUTH", new Error());
            reject();
          });
      });
    },

    finishAssertion({ commit }, payload) {
      commit("SET_AUTH");
      return new Promise<void>((resolve, reject) => {
        api
          .post("/authentication/login", payload)
          .then(({ data: apiResponse }) => {
            if (apiResponse.status === "success") {
              const jwt = apiResponse.data.accesstoken;
              api.defaults.headers.common.Authorization = `Bearer ${jwt}`;
              sessionStorage.setItem("token", jwt);
              commit("SET_AUTH", jwt);
              resolve();
            } else {
              commit("SET_AUTH", new Error(apiResponse.error[0].message));
              reject(apiResponse);
            }
          })
          .catch(() => {
            commit("SET_AUTH", new Error());
            reject();
          });
      });
    },

    logout(context) {
      if (api.defaults.headers.common.Authorization === undefined) {
        return Promise.reject();
      }
      context.commit("SET_AUTH", null);
      delete api.defaults.headers.common.Authorization;
      sessionStorage.removeItem("token");
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.auth.data,
    authGetStatus: (state) => state.auth.status,
  },
  modules: {},
});
