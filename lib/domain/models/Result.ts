export class Result<RESULT_DATA> {
  isSuccess: boolean;
  errorMessages: string[];
  resultData: RESULT_DATA;

  constructor(
    isSuccess: boolean,
    errorMessages: string[],
    resultData?: RESULT_DATA,
  ) {
    this.isSuccess = isSuccess;
    this.errorMessages = errorMessages;
    this.resultData = resultData || null;
  }

  get isFailure() {
    return !this.isSuccess;
  }

  static success<RESULT_DATA>(resultData: RESULT_DATA): Result<RESULT_DATA> {
    return new Result<RESULT_DATA>(true, [], resultData);
  }

  static failure(errorMessages: string[]): Result<never> {
    return new Result<never>(false, errorMessages);
  }
}
