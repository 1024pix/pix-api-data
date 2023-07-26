import {
  userRepository,
  UserRepository,
} from '../../infrastructure/UserRepository.js';
import {
  encryptionService,
  EncryptionService,
} from '../../infrastructure/utils/EncryptionService.js';
import {
  jsonWebTokenService,
  JSONWebTokenService,
} from '../../infrastructure/utils/JSONWebTokenService.js';
import { Result } from '../models/Result.js';
import type { AuthenticationCommand } from '../commands/AuthenticationCommand.js';
import type { User } from '../models/User.js';

export interface AuthenticateUserUsecase {
  authenticateUser(
    _authenticationCommand: AuthenticationCommand,
  ): Promise<Result<string>>;
}
class AuthenticateUserUsecaseImpl implements AuthenticateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly jsonWebTokenService: JSONWebTokenService,
  ) {
    this.userRepository = userRepository;
    this.encryptionService = encryptionService;
    this.jsonWebTokenService = jsonWebTokenService;
  }

  async authenticateUser(
    authenticationCommand: AuthenticationCommand,
  ): Promise<Result<string>> {
    const user: User = await this.userRepository.findByName(
      authenticationCommand.username,
    );
    if (!user) {
      return Result.failure(['cannot authenticate user']);
    }
    const arePasswordIdentical = await this.encryptionService.checkPassword(
      authenticationCommand.password,
      user.hashedPassword,
    );
    if (!arePasswordIdentical) {
      return Result.failure(['cannot authenticate user']);
    }
    return Result.success(
      await this.jsonWebTokenService.generateToken(user.id),
    );
  }
}

export const authenticateUserUsecase: AuthenticateUserUsecase =
  new AuthenticateUserUsecaseImpl(
    userRepository,
    encryptionService,
    jsonWebTokenService,
  );
