export enum APIResponseStatuses {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export class APIResponse {
  status: APIResponseStatuses;
  data: any[];
  messages: string[];

  constructor(status: APIResponseStatuses, data: any[], messages: string[]) {
    this.status = status;
    this.data = data;
    this.messages = messages;
  }

  static success(data: any[]) {
    return new APIResponse(APIResponseStatuses.SUCCESS, data, []);
  }

  static failure(messages: string[]) {
    return new APIResponse(APIResponseStatuses.FAILURE, [], messages);
  }
}
