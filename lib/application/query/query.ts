import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { UserCommand } from '../../domain/models/UserCommand.ts';
import { Result } from '../../domain/models/Result.ts';
import { executeQueryUseCase } from '../../domain/usecases/ExecuteQueryUsecase.ts';
import { APIResponse } from '../APIResponse.ts';

export async function execute(
  clientRequest: Request,
  h: ResponseToolkit,
): Promise<ResponseObject> {
  const userCommandValidationResult: Result<UserCommand> =
    UserCommand.buildFromPayload(clientRequest.payload);
  if (userCommandValidationResult.isFailure) {
    return h
      .response(APIResponse.failure(userCommandValidationResult.errorMessages))
      .code(400);
  }

  const queryExecutionResult = await executeQueryUseCase.executeQuery(
    userCommandValidationResult.resultData,
  );
  if (queryExecutionResult.isFailure) {
    return h
      .response(APIResponse.failure(queryExecutionResult.errorMessages))
      .code(422);
  }

  return h.response(
    APIResponse.success(queryExecutionResult.resultData.result),
  );
}
