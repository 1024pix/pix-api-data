import { expect } from '../../../test-helper.js';
import { userRepository } from '../../../../lib/infrastructure/UserRepository.js';
import { userLoginRepository } from '../../../../lib/infrastructure/UserLoginRepository.js';
import { AuthenticationCommand } from '../../../../lib/domain/commands/AuthenticationCommand.js';
import { Result } from '../../../../lib/domain/models/Result.js';
import { AuthenticateUserUsecaseImpl } from '../../../../lib/domain/usecases/AuthenticateUserUsecase.js';
import { encryptionService } from '../../../../lib/infrastructure/utils/EncryptionService.js';
import { jsonWebTokenService,  } from '../../../../lib/infrastructure/utils/JSONWebTokenService.js';
import { sinon } from '../../../test-helper.js';

describe('Unit | Domain | Usecases | AuthenticateUserUsecase', function () {

  let findByNameStub, checkPasswordStub, generateTokenStub, userLoginFindByUserIdStub, userLoginRepositoryCreateStub;

  beforeEach(function () {
    findByNameStub = sinon.stub(userRepository, 'findByName')
    checkPasswordStub = sinon.stub(encryptionService, 'checkPassword')
    generateTokenStub = sinon.stub(jsonWebTokenService, 'generateToken')
    userLoginFindByUserIdStub = sinon.stub(userLoginRepository, 'findByUserId')
    userLoginRepositoryCreateStub  = sinon.stub(userLoginRepository, 'create')

  });

  describe('#authenticateUser', function () {

    context('when user is not found', function() {
      it('should return failure result', async function() {
        // given
        const authenticationCommand = new AuthenticationCommand('foo', 'bar');

        findByNameStub.withArgs(authenticationCommand.username).resolves(null);

        const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService);

        // when
        const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

        // then
        expect(result).to.be.instanceOf(Result);
        expect(result.isFailure).to.be.true;
      });
    });

    context('when user is found', function() {
      context('when given bad password', function() {
        it('should return failed result', async function() {
          // given
          const authenticationCommand = new AuthenticationCommand('foo', 'bar');

          const hashedPassword = 'hashed-password';
          findByNameStub.withArgs(authenticationCommand.username).resolves({ hashedPassword });
          checkPasswordStub.withArgs(authenticationCommand.password, hashedPassword).resolves(false);

          const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService);// when

          // when
          const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

          // then
          expect(result).to.be.instanceOf(Result);
          expect(result.isFailure).to.be.true;
        });
      });

      context('when given good password', function() {
          it('should return token', async function() {
            // given
            const authenticationCommand = new AuthenticationCommand('foo', 'bar');

            const hashedPassword = 'hashed-password';
            findByNameStub.withArgs(authenticationCommand.username).resolves({ hashedPassword });
            checkPasswordStub.withArgs(authenticationCommand.password, hashedPassword).resolves(true);

            const expectedToken = 'expected-token';
            generateTokenStub.resolves(expectedToken);

            const authenticateUserUsecase = new AuthenticateUserUsecaseImpl(userRepository, encryptionService, jsonWebTokenService);

            // when
            const result = await authenticateUserUsecase.authenticateUser(authenticationCommand);

            // then
            expect(result).to.be.instanceOf(Result);
            expect(result.isSuccess).to.be.true;
            expect(result.resultData).to.be.equal(expectedToken);
          });
        });
   })
  })
});