import { Request, ResponseToolkit } from '@hapi/hapi';
import { Result } from '../../domain/models/Result.ts';
import { AuthenticationCommand } from '../../domain/commands/AuthenticationCommand.ts';
import { APIResponse } from '../APIResponse.ts';
import { authenticateUserUsecase } from '../../domain/usecases/AuthenticateUserUsercase.ts';

export async function authenticate(clientRequest: Request, h: ResponseToolkit) {
  const authenticationCommandValidationResult: Result<AuthenticationCommand> =
    AuthenticationCommand.buildFromPayload(clientRequest.payload);
  if (authenticationCommandValidationResult.isFailure) {
    return h
      .response(
        APIResponse.failure(
          authenticationCommandValidationResult.errorMessages,
        ),
      )
      .code(400);
  }

  const userAuthenticationResult =
    await authenticateUserUsecase.authenticateUser(
      authenticationCommandValidationResult.resultData,
    );
  if (userAuthenticationResult.isFailure) {
    return h
      .response(APIResponse.failure(userAuthenticationResult.errorMessages))
      .code(401);
  }

  return h.response(
    APIResponse.authenticationSuccess(userAuthenticationResult.resultData),
  );
}
