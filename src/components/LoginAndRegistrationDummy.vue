<template>
  <div id="authentication">
    <form>
      <input
        v-model="username"
        type="email"
        name="Your Email"
        placeholder="user@securebookingservice.de"
      />
      <button v-on:click="onLogin">Login</button>
      <button v-on:click="onRegister">Register</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

@Options({
  data: () => ({
    username: undefined,
  }),
  methods: {
    onLogin(event: Event) {
      event.preventDefault();

      if (this.username === undefined || this.username === "")
        return console.error("Please enter username");

      // Request assertion options from server
      this.$store
        .dispatch("startAssertion", this.username)
        .then(async (assertionOptions: any) => {
          try {
            // Pass the assertion options to the authenticator and wait for a response
            // User will use an authenticator and will generate a response
            const assertionResponse = await startAuthentication(
              assertionOptions
            );

            // Verify response from authenticator
            this.verifyAssertion(this.username, assertionResponse);
          } catch (error: any) {
            // Handle error during challenge solving process
            console.log(error);
            switch (error.name) {
              case "AbortError":
                // Login process timed out or cancelled
                console.error("Login aborted!");
                break;

              default:
                console.error("Something went wrong during login!");
                break;
            }
          }
        })
        .catch((apiResponse?: any) => {
          if (apiResponse?.code)
            return console.error(apiResponse.error[0].message);

          // Request failed locally - maybe no internet connection etc?
          return console.error("Something went wrong locally - Check internet?");
        });
    },
    onRegister(event: Event) {
      event.preventDefault();

      if (this.username === undefined || this.username === "")
        return console.error("Please enter username");

      const token = prompt("Enter your token:");
      if (token === undefined || token === "")
        return console.error("Please enter a token!");

      // Request attestation options from server
      this.$store
        .dispatch("startAttestation", { username: this.username, token })
        .then(async (attestationOptions: any) => {
          try {
            // Pass the attestation options to the authenticator and wait for a response
            // User will use an authenticator and will generate a response
            const attestationResponse = await startRegistration(
              attestationOptions
            );

            // Verify response from authenticator
            this.verifyAttestation(this.username, token, attestationResponse);
          } catch (error: any) {
            // Handle error during challenge solving process
            switch (error.name) {
              case "AbortError":
                // Registration process timed out or cancelled
                console.error("Registration aborted");
                break;

              case "InvalidStateError":
                // Authenticator is maybe already used for this
                console.error("Authenticator invalid!");
                break;

              default:
                console.error("Something went wrong :(");
                break;
            }
          }
        })
        .catch((apiResponse?: any) => {
          if (apiResponse?.code) {
            console.error(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            console.error("Something went wrong locally - Check internet?");
          }
        });
    },

    verifyAttestation(
      username: string,
      token: string,
      attestationResponse: any
    ) {
      const payload = {
        username,
        token,
        attestationResponse,
      };
      this.$store
        .dispatch("finishAttestation", payload)
        .then(() => {
          // registration was successful and jwt was received; redirect to dashboard
          this.$router.push("dashboard");
          alert("Registered successfully");
        })
        .catch((apiResponse?: any) => {
          if (apiResponse?.code) {
            console.error(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            console.error("Something went wrong - Check internet?");
          }
        });
    },
    verifyAssertion(username: string, assertionResponse: any) {
      this.$store
        .dispatch("finishAssertion", { username, assertionResponse })
        .then(() => {
          // login was successful and jwt was received; redirect to dashboard
          this.$router.push("");
          alert("Logged in successfully");
        })
        .catch((apiResponse?: any) => {
          if (apiResponse?.code) {
            console.error(apiResponse.error[0].message);
          } else {
            // request failed locally - maybe no internet connection etc?
            console.error("Something went wrong locally - Check internet?");
          }
        });
    },
  },
})
export default class LoginAndRegistrationDummy extends Vue {}
</script>

<style></style>
