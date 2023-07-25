export enum APIResponseStatuses {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export class APIResponse<TYPE_DATA> {
  status: APIResponseStatuses;
  messages: string[];
  data: TYPE_DATA[];

  constructor(
    status: APIResponseStatuses,
    messages: string[],
    data?: TYPE_DATA[],
  ) {
    this.status = status;
    this.data = data;
    this.messages = messages || null;
  }

  static success<TYPE_DATA>(data: TYPE_DATA[]): APIResponse<TYPE_DATA> {
    return new APIResponse<TYPE_DATA>(APIResponseStatuses.SUCCESS, [], data);
  }

  static failure(messages: string[]): APIResponse<never> {
    return new APIResponse(APIResponseStatuses.FAILURE, messages);
  }
}
