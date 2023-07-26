import { config } from '../common/config.ts';
import { logger } from '../common/logger/Logger.ts';

export enum APIResponseStatuses {
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

  static authenticationSuccess(accessToken: string): APIResponse<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    return new APIResponse(APIResponseStatuses.SUCCESS, [], {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: config.authentication.accessTokenLifespanMS,
    });
  }

  static failure(messages: string[]): APIResponse<never> {
    logger.warn(messages.join('\n'));
    return new APIResponse(APIResponseStatuses.FAILURE, messages);
  }
}
