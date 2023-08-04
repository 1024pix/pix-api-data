import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { executeQueryUseCase } from '../../domain/usecases/ExecuteQueryUsecase.js';
import { APIResponse } from '../APIResponse.js';
import { UserCommandBuilder } from '../../domain/commands/UserCommandBuilder.js';

export async function execute(
  clientRequest: Request,
  h: ResponseToolkit,
): Promise<ResponseObject> {
  const userCommandBuilder = new UserCommandBuilder(clientRequest.payload);
  const userCommandValidationResult = userCommandBuilder.build();
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
