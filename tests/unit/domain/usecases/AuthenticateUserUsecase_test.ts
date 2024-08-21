import { expect, sinon } from '../../../test-helper.js';
import { userRepository } from '../../../../lib/infrastructure/UserRepository.js';
import { userLoginRepository } from '../../../../lib/infrastructure/UserLoginRepository.js';
import { AuthenticationCommand } from '../../../../lib/domain/commands/AuthenticationCommand.js';
import { Result } from '../../../../lib/domain/models/Result.js';
import { AuthenticateUserUsecaseImpl } from '../../../../lib/domain/usecases/AuthenticateUserUsecase.js';
import { encryptionService } from '../../../../lib/infrastructure/utils/EncryptionService.js';
import { jsonWebTokenService } from '../../../../lib/infrastructure/utils/JSONWebTokenService.js';

describe('Unit | Domain | Usecases | AuthenticateUserUsecase', function () {
  let findByNameStub;
  let checkPasswordStub;
  let generateTokenStub;
  let userLoginFindByUserIdStub;
  let userLoginRepositoryCreateStub;
  let userLoginRepositoryUpdateStub;

  beforeEach(function () {
    findByNameStub = sinon.stub(userRepository, 'findByName');
    checkPasswordStub = sinon.stub(encryptionService, 'checkPassword');
    generateTokenStub = sinon.stub(jsonWebTokenService, 'generateToken');
    userLoginFindByUserIdStub = sinon.stub(userLoginRepository, 'findByUserId');
    userLoginRepositoryCreateStub = sinon.stub(userLoginRepository, 'create');
    userLoginRepositoryUpdateStub = sinon.stub(userLoginRepository, 'update');
  });

  describe('#authenticateUser', function () {
    context('when user is not found', function () {
      it('should return failure result', async function () {
        // given
        const authenticationCommand = new AuthenticationCommand('foo', 'bar');

        findByNameStub.withArgs(authenticationCommand.username).resolves(null);

        const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService, userLoginRepository);

        // when
        const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

        // then
        expect(result).to.be.instanceOf(Result);
        expect(result.isFailure).to.be.true;
      });
    });

    context('when user is found', function () {
      context('when userLogin is not found', function () {
        it('should create userLogin', async function () {
          // given
          const authenticationCommand = new AuthenticationCommand('foo', 'bar');
          const user = { id: '26f6efcc-ce13-4b20-b6ea-5bebae6115af' };

          findByNameStub.resolves(user);
          userLoginFindByUserIdStub.withArgs(user.id).resolves(null);
          userLoginRepositoryCreateStub.withArgs(user.id).resolves({ successfulAttempt: () => {} });

          checkPasswordStub.resolves(true);
          generateTokenStub.resolves();

          const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService, userLoginRepository);

          // when
          await authenticateUserUsecase.authenticateUser(authenticationCommand);

          // then
          expect(userLoginRepositoryCreateStub).to.have.been.calledWithExactly(user.id);
        });
      });

      context('when userLogin is found', function () {
        context('when given bad password', function () {
          it('should call failedAttempt in userLogin, update it, and return failed result', async function () {
            // given
            const authenticationCommand = new AuthenticationCommand('foo', 'bar');

            const hashedPassword = 'hashed-password';
            findByNameStub.withArgs(authenticationCommand.username).resolves({ hashedPassword });
            checkPasswordStub.withArgs(authenticationCommand.password, hashedPassword).resolves(false);

            const userLogin = {
              failedAttempt: sinon.stub(),
            };
            userLoginFindByUserIdStub.resolves(userLogin);

            const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService, userLoginRepository);

            // when
            const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

            // then
            expect(userLogin.failedAttempt).to.have.been.called;
            expect(userLoginRepositoryUpdateStub).to.have.been.calledWithExactly(userLogin);
            expect(result).to.be.instanceOf(Result);
            expect(result.isFailure).to.be.true;
          });
        });

        context('when given good password', function () {
          it('should mark userLogin has success, update it and return token', async function () {
            // given
            const authenticationCommand = new AuthenticationCommand('foo', 'bar');

            const hashedPassword = 'hashed-password';
            findByNameStub.withArgs(authenticationCommand.username).resolves({ hashedPassword });
            checkPasswordStub.withArgs(authenticationCommand.password, hashedPassword).resolves(true);

            const expectedToken = 'expected-token';
            generateTokenStub.resolves(expectedToken);

            const userLogin = {
              successfulAttempt: sinon.stub(),
            };
            userLoginFindByUserIdStub.resolves(userLogin);

            const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService, userLoginRepository);

            // when
            const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

            // then
            expect(result).to.be.instanceOf(Result);
            expect(result.isSuccess).to.be.true;
            expect(result.resultData).to.be.equal(expectedToken);
            expect(userLogin.successfulAttempt).to.have.been.called;
            expect(userLoginRepositoryUpdateStub).to.have.been.calledWithExactly(userLogin);
          });
        });
      });
    });
  });
});
