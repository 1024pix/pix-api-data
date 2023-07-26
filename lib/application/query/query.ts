import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { UserCommand } from '../../domain/commands/UserCommand.js';
import type { Result } from '../../domain/models/Result.js';
import { executeQueryUseCase } from '../../domain/usecases/ExecuteQueryUsecase.js';
import { APIResponse } from '../APIResponse.js';

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
