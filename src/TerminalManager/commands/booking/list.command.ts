import { ICommand } from "@/TerminalManager";
import { user } from "@/overmind/user";
import { api } from "@/utils/ApiUtil";
import { Booking } from "@secure-booking-service/common-types";
import { Roles } from "@secure-booking-service/common-types/Roles";
import { blue } from "ansi-colors";
import { AxiosRequestConfig } from "axios";
import isEmail from "validator/lib/isEmail";
import { printApiError } from "../helper";
import { printBookings } from "./helpers";

export const listCommand: ICommand = {
  command: "list",
  description: "Get a list of bookings",
  usage: ["[mine] [all] [EMAIL]"],
  callback: async (manager, param) => {
    // Check if user has enough permissions
    if (![Roles.TRAVELAGENT, Roles.TRAVELLEAD].some(role => user.state.roles.includes(role)))
      return manager.writeError("Unauthorized: You dont have the permission to view bookings!");

    const MINE = "MINE";
    const ALL = "ALL";

    // Generate request parameters
    let requestParams = undefined;
    if (param.toUpperCase() === MINE) {
      requestParams = { filter: user.state.email };
    }
    else if (isEmail(param)) {
      requestParams = { filter: param };
    }
    else if (param.toUpperCase() === ALL) {
      requestParams = {};
    }
    else {
      manager.writeError("Wrong search criteria: Use 'mine', 'all' or specify an email address!");
      return;
    }

    // Check if user has enough permissions
    if (param.toUpperCase() !== MINE && !user.state.roles.includes(Roles.TRAVELLEAD))
      return manager.writeError("Unauthorized: You dont have the permission to search all bookings!");

    // Get and print bookings
    const requestConfig: AxiosRequestConfig = {
      params: requestParams
    };
    try {
      const apiResponse = await api.get("/bookings", requestConfig);
      if (apiResponse.status !== 200) return printApiError(apiResponse);

      const bookings = apiResponse.data.data as Booking[];
      if (bookings.length === 0) return manager.writeError(`No bookings found!`, true);
      
      manager.writeSuccess(`Found ${blue.bold(String(bookings.length))} bookings`, true);
      await printBookings(bookings);
    }
    catch (error: unknown) {
      if (error !== undefined && error instanceof Error) {
        manager.writeError(error.message);
        manager.writeLine();
        console.error(error);
      }
    }
  },
};
