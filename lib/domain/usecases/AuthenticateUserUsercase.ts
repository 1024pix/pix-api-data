import {
  userRepository,
  UserRepository,
} from '../../infrastructure/UserDatasource.ts';
import {
  encryptionService,
  EncryptionService,
} from '../../infrastructure/utils/EncryptionService.ts';
import {
  jsonWebTokenService,
  JSONWebTokenService,
} from '../../infrastructure/utils/JSONWebTokenService.ts';
import { Result } from '../models/Result.ts';
import { AuthenticationCommand } from '../commands/AuthenticationCommand.ts';
import { User } from '../models/User.ts';

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
    const user: User = await userRepository.findByName(
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
    return Result.success(this.jsonWebTokenService.generateToken(user.id));
  }
}

export const authenticateUserUsecase: AuthenticateUserUsecase =
  new AuthenticateUserUsecaseImpl(
    userRepository,
    encryptionService,
    jsonWebTokenService,
  );
