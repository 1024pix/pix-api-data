export class Result<ResultData> {
  isSuccess: boolean;
  errorMessages: string[];
  resultData: ResultData;

  constructor(
    isSuccess: boolean,
    errorMessages: string[],
    resultData?: ResultData,
  ) {
    this.isSuccess = isSuccess;
    this.errorMessages = errorMessages;
    this.resultData = resultData || null;
  }

  get isFailure() {
    return !this.isSuccess;
  }

  static success<ResultData>(resultData: ResultData): Result<ResultData> {
    return new Result<ResultData>(true, [], resultData);
  }

  static failure(errorMessages: string[]): Result<never> {
    return new Result<never>(false, errorMessages);
  }
}
