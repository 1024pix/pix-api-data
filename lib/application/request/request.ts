import { Request, ResponseToolkit } from '@hapi/hapi';
import { UserCommand } from '../../domain/models/UserCommand.ts';
import { Result } from '../../domain/models/Result.ts';
// import { executeQueryUseCase } from '../../domain/usecases/ExecuteQueryUsecase.ts';

export async function execute(clientRequest: Request, h: ResponseToolkit) {
  const userCommandValidationResult: Result<UserCommand> =
    UserCommand.buildFromPayload(clientRequest.payload);
  if (userCommandValidationResult.isFailure) {
    return h
      .response(userCommandValidationResult.formattedErrorMessages)
      .code(400);
  }
  /*
  const result = await executeQueryUsecase.executeQuery(
    userCommandValidationResult.resultData,
  );
  */

  return h.response('command valide !');
}
