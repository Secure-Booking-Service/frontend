/**
 * This file is based on the great work of sindresorhus/ansi-escapes.
 * Unfortunately, this packages can not be used together with vite
 */
const ESC = "[";
const eraseScreen = ESC + "2J";
const isTerminalApp = false;
let ansiEscapes = {
  cursorMove(x: number, y: number): string {
    if (typeof x !== "number") {
      throw new TypeError("The `x` argument is required");
    }
    let returnValue = "";
    if (x < 0) {
      returnValue += ESC + -x + "D";
    } else if (x > 0) {
      returnValue += ESC + x + "C";
    }
    if (y < 0) {
      returnValue += ESC + -y + "A";
    } else if (y > 0) {
      returnValue += ESC + y + "B";
    }
    return returnValue;
  },
  cursorSavePosition: () => isTerminalApp ? "7" : ESC + "s",
  cursorRestorePosition: () =>  isTerminalApp ? "8" : ESC + "u",
  clearTerminal: () => `${eraseScreen}${ESC}3J${ESC}H`,
};


export default ansiEscapes;