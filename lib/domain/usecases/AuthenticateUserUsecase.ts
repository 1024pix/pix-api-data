import type {
  UserRepository,
} from '../../infrastructure/UserRepository.js';
import {
  userRepository,
} from '../../infrastructure/UserRepository.js';
import type {
  EncryptionService,
} from '../../infrastructure/utils/EncryptionService.js';
import {
  encryptionService,
} from '../../infrastructure/utils/EncryptionService.js';
import type {
  JSONWebTokenService,
} from '../../infrastructure/utils/JSONWebTokenService.js';
import {
  jsonWebTokenService,
} from '../../infrastructure/utils/JSONWebTokenService.js';
import { Result } from '../models/Result.js';
import type { AuthenticationCommand } from '../commands/AuthenticationCommand.js';
import type { User } from '../models/User.js';
import { type UserLoginRepository, userLoginRepository } from '../../infrastructure/UserLoginRepository.js';

export interface AuthenticateUserUsecase {
  authenticateUser: (
    _authenticationCommand: AuthenticationCommand,
  ) => Promise<Result<string>>;
}
export class AuthenticateUserUsecaseImpl implements AuthenticateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly jsonWebTokenService: JSONWebTokenService,
    private readonly userLoginRepository: UserLoginRepository,
  ) {
    this.userRepository = userRepository;
    this.encryptionService = encryptionService;
    this.jsonWebTokenService = jsonWebTokenService;
    this.userLoginRepository = userLoginRepository;
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

    let userLogin = await this.userLoginRepository.findByUserId(user.id);
    if (!userLogin) {
      userLogin = await this.userLoginRepository.create(user.id);
    }

    const arePasswordIdentical = await this.encryptionService.checkPassword(
      authenticationCommand.password,
      user.hashedPassword,
    );
    if (!arePasswordIdentical) {
      userLogin.failedAttempt();
      await userLoginRepository.update(userLogin);

      return Result.failure(['cannot authenticate user']);
    }

    userLogin.successfulAttempt();
    await userLoginRepository.update(userLogin);

    return Result.success(
      await this.jsonWebTokenService.generateToken(user.id),
    );
  }
}

export const authenticateUserUsecase: AuthenticateUserUsecase
  = new AuthenticateUserUsecaseImpl(
    userRepository,
    encryptionService,
    jsonWebTokenService,
    userLoginRepository,
  );
