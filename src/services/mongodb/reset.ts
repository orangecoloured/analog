import { mongodb } from "./mongodb.js";

export const resetData = () => {
  return mongodb.drop();
};
