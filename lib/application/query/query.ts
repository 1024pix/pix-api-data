import { Readable } from 'node:stream';
import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';

import { Transform } from '@json2csv/node';
import { UserCommand } from '../../domain/commands/UserCommand.js';
import type { Result } from '../../domain/models/Result.js';
import { executeQueryUseCase } from '../../domain/usecases/ExecuteQueryUsecase.js';
import { APIResponse } from '../APIResponse.js';

export async function execute(
  clientRequest: Request,
  h: ResponseToolkit,
): Promise<ResponseObject> {
  const requesterId = clientRequest.auth.credentials.userId;

  const userCommandValidationResult: Result<UserCommand>
    = UserCommand.buildFromPayload(clientRequest.payload, requesterId);
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

  if (clientRequest.headers.accept === 'text/csv') {
    const parser = new Transform({}, {}, { objectMode: true });

    // cf: https://github.com/hapijs/hapi/issues/3733#issuecomment-361944940
    const wrappedStream = new Readable().wrap(queryExecutionResult.resultData.result.pipe(parser));
    return h.response(wrappedStream).type('text/csv');
  }

  return h.response(
    APIResponse.successStream(queryExecutionResult.resultData.result),
  ).type('application/json');
}
