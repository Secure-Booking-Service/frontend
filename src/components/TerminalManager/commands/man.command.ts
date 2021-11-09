import router from "@/router";
import { ICommand } from "..";

export const manCommand: ICommand = {
  command: "man",
  description: "Opens the documentation page.",
  callback: async () => {
    router.push("/manual");
    return "Opening documentation page...\r\n";
  },
}