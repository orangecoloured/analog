import type { TData, TPaginatedData } from "../../utils";

import {
  cleanUpAllData as redisCleanUpAllData,
  cleanUpDataByCursor as redisCleanUpDataByCursor,
} from "../redis/cleanUp.js";
import {
  getAllData as redisGetAllData,
  getDataByCursor as redisGetDataByCursor,
} from "../redis/get.js";
import { pushData as redisPushData } from "../redis/push.js";

import {
  cleanUpAllData as postgresqlCleanUpAllData,
  cleanUpDataByCursor as postgresqlCleanUpDataByCursor,
} from "../postgresql/cleanUp.js";
import {
  getAllData as postgresqlGetAllData,
  getDataByCursor as postgresqlGetDataByCursor,
} from "../postgresql/get.js";
import { pushData as postgresqlPushData } from "../postgresql/push.js";

import {
  cleanUpAllData as mongodbCleanUpAllData,
  cleanUpDataByCursor as mongodbCleanUpDataByCursor,
} from "../mongodb/cleanUp.js";
import {
  getAllData as mongodbGetAllData,
  getDataByCursor as mongodbGetDataByCursor,
} from "../mongodb/get.js";
import { pushData as mongodbPushData } from "../mongodb/push.js";

const generateDatabaseAdapter = () => {
  switch (process.env.ANALOG_DATABASE_PROVIDER) {
    case "postgresql": {
      return {
        cleanUpAllData: postgresqlCleanUpAllData,
        cleanUpDataByCursor: postgresqlCleanUpDataByCursor,
        getAllData: postgresqlGetAllData,
        getDataByCursor: postgresqlGetDataByCursor,
        pushData: postgresqlPushData,
      };
    }

    case "redis": {
      return {
        cleanUpAllData: redisCleanUpAllData,
        cleanUpDataByCursor: redisCleanUpDataByCursor,
        getAllData: redisGetAllData,
        getDataByCursor: redisGetDataByCursor,
        pushData: redisPushData,
      };
    }

    case "mongodb": {
      return {
        cleanUpAllData: mongodbCleanUpAllData,
        cleanUpDataByCursor: mongodbCleanUpDataByCursor,
        getAllData: mongodbGetAllData,
        getDataByCursor: mongodbGetDataByCursor,
        pushData: mongodbPushData,
      };
    }

    default: {
      return {
        cleanUpAllData: () => Promise.resolve("OK" as const),
        cleanUpDataByCursor: () => Promise.resolve("OK"),
        getAllData: () => Promise.resolve({} as TData),
        getDataByCursor: () =>
          Promise.resolve({ data: {}, nextCursor: "0" } as TPaginatedData),
        pushData: () => Promise.resolve(0),
      };
    }
  }
};

export const databaseAdapter = generateDatabaseAdapter();
