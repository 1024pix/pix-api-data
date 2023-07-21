export class Result<ResultData> {
  isSuccess: boolean;
  errorMessages: string[];
  resultData?: ResultData;

  constructor(
    isSuccess: boolean,
    errorMessages: string[],
    resultData: ResultData,
  ) {
    this.isSuccess = isSuccess;
    this.errorMessages = errorMessages;
    this.resultData = resultData;
  }

  get formattedErrorMessages() {
    return this.errorMessages.join(', ');
  }

  get isFailure() {
    return !this.isSuccess;
  }

  static success(resultData: any) {
    return new Result(true, [], resultData);
  }

  static failure(errorMessages: string[]) {
    return new Result(false, errorMessages, null);
  }
}
