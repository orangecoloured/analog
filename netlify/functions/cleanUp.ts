import type { Handler } from '@netlify/functions';
import { HEADER_TEXT_PLAIN, HEADERS_CROSS_ORIGIN } from '../../src/services/api';
import { cleanUpOldData } from '../../src/services/redis';

export const handler: Handler = async () => {
  await cleanUpOldData();

  return {
    statusCode: 200,
    headers: {
      ...HEADERS_CROSS_ORIGIN,
      ...HEADER_TEXT_PLAIN,
    },
  };
};
