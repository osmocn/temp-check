import { customAlphabet } from "nanoid";
import { SLUG_LENGTH } from "./common";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export const slugNanoid = () => {
  return customAlphabet(alphabet, SLUG_LENGTH)();
};
