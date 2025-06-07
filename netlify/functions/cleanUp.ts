import type { Handler } from '@netlify/functions';
import { cleanUpOldData } from '../../src/services/redis';

export const handler: Handler = async () => {
  await cleanUpOldData();

  return {
    statusCode: 200,
  };
};
