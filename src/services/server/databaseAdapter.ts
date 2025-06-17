import type { TData, TPaginatedData } from "../../utils";
import {
  cleanUpAllData as redisCleanUpAllData,
  cleanUpDataByCursor as redisCleanUpDataByCursor,
  getAllData as redisGetAllData,
  getDataByCursor as redisGetDataByCursor,
  pushData as redisPushData,
} from "../redis";
import {
  cleanUpAllData as postgresqlCleanUpAllData,
  cleanUpDataByCursor as postgresqlCleanUpDataByCursor,
  getAllData as postgresqlGetAllData,
  getDataByCursor as postgresqlGetDataByCursor,
  pushData as postgresqlPushData,
} from "../postgresql";

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
