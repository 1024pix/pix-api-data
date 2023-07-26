import type { Request, ResponseToolkit } from '@hapi/hapi';
import type { Result } from '../../domain/models/Result.js';
import { AuthenticationCommand } from '../../domain/commands/AuthenticationCommand.js';
import { APIResponse } from '../APIResponse.js';
import { authenticateUserUsecase } from '../../domain/usecases/AuthenticateUserUsercase.js';

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
