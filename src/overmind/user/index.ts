import { createOvermind } from "overmind";
import { config } from "./config";

export const user = createOvermind(config);
