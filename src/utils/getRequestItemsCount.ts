import { DATABASE_REQUEST_ITEMS_COUNT } from "./constants.js";

export const getRequestItemsCount = () => {
  let requestItemsCount = Number(
    process.env.ANALOG_DATABASE_REQUEST_ITEM_COUNT as string,
  );

  if (isNaN(requestItemsCount)) {
    requestItemsCount = DATABASE_REQUEST_ITEMS_COUNT;
  }

  return requestItemsCount;
};
