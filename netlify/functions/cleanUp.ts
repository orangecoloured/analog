import type { Handler } from '@netlify/functions';
import { cleanUpOldData } from "../../api/cleanUp";

export const handler: Handler = async () => {
  await cleanUpOldData();
  
  return {
    statusCode: 200,
  };
};