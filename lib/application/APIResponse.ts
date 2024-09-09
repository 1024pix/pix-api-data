import { Readable } from 'node:stream';
import { config } from '../common/config.js';
import { logger } from '../common/logger/Logger.js';

enum APIResponseStatuses {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export class APIResponse<TYPE_DATA> {
  status: APIResponseStatuses;
  messages: string[];
  data: TYPE_DATA;

  constructor(
    status: APIResponseStatuses,
    messages: string[],
    data?: TYPE_DATA,
  ) {
    this.status = status;
    this.data = data;
    this.messages = messages;
  }

  static success<TYPE_DATA>(data: TYPE_DATA): APIResponse<TYPE_DATA> {
    return new APIResponse<TYPE_DATA>(APIResponseStatuses.SUCCESS, [], data);
  }

  static successStream(data: Readable): Readable {
    const stream = new Readable({
      read() {},
    });
    stream.push('{"status":"success","data":[');

    let isFirstLine = true;

    data.on('data', (row) => {
      if (!isFirstLine) {
        stream.push(',');
      }
      isFirstLine = false;
      stream.push(JSON.stringify(row));
    });

    data.on('end', () => {
      stream.push('], "messages": []}');
      stream.push(null);
    });

    return stream;
  };

  static authenticationSuccess(accessToken: string): APIResponse<{
    access_token: string;
    token_type: string;
    expires_in: string;
  }> {
    return new APIResponse(APIResponseStatuses.SUCCESS, [], {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: config.authentication.accessTokenLifespan,
    });
  }

  static failure(messages: string[]): APIResponse<never> {
    logger.warn(messages.join('\n'));
    return new APIResponse(APIResponseStatuses.FAILURE, messages);
  }
}
