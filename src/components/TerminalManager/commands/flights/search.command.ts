import { AxiosRequestConfig } from "axios";
import { ICommand } from "../..";
import { api } from "../../../../store/utils/ApiUtil";
import { booking } from "@/overmind/booking";
import { noCurrentBooking } from "../booking/helpers";

export const searchCommand: ICommand = {
    command: "search",
    description: "Search a flight",
    usage: ["ORIGIN", "DESTINATION", "DEPARTURE-DATE"],
    callback: async (manager, ...args) => {
        if (noCurrentBooking()) return;
        const [originLocationCode, destinationLocationCode, departureDate] = args;
        const adults = booking.state.passengers.length
        const requestConfig: AxiosRequestConfig = {
            params: {
                originLocationCode,
                destinationLocationCode,
                departureDate,
                adults
            }
        }
        const apiResponse = await api.get("/flights", requestConfig)
        if (apiResponse.status === 200) {
            const flightOffers = apiResponse.data;
            console.log(flightOffers);
        } else {
            manager.writeError("Fehler: " + apiResponse.statusText);
            const errors = apiResponse.data.error;
            console.log(errors);
            if (errors instanceof Array) {
                manager.writeError("Details:");
                errors.forEach((err: any) => {
                    manager.writeError("- " + err.message);
                });
            }
        }
    },
};
