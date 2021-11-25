import { createOvermind } from "overmind";
import { config } from "./config";

export const flights = createOvermind(config);
