import { DATABASE_REQUEST_ITEMS_COUNT } from "./constants.js";

export const getRequestItemCount = () => {
  let requestItemCount = Number(
    process.env.ANALOG_DATABASE_REQUEST_ITEM_COUNT as string,
  );

  if (isNaN(requestItemCount)) {
    requestItemCount = DATABASE_REQUEST_ITEMS_COUNT;
  }

  return requestItemCount;
};
