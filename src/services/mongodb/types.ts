import type { ObjectId } from "mongodb";

export type TEventDoc = {
  _id?: ObjectId;
  event: string;
  timestamp: number;
};

export type TPaginatedQuery = {
  timestamp: {
    $gte?: number;
    $gt?: number;
    $lt?: number;
  };
};
