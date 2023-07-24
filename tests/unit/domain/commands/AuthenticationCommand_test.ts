import { expect } from 'chai';
import { AuthenticationCommand } from '../../../../lib/domain/commands/AuthenticationCommand.ts';
import { Result } from '../../../../lib/domain/models/Result.ts';

describe('Unit | Domain | AuthenticationCommand', function () {
  describe('buildFromPayload', function () {
    context('when payload is valid', function () {
      it('should return a successful Result', function () {
        // given
        const validPayload = {
          username: 'pipo_jambon',
          password: 'SasukeDu66',
        };

        // when
        const result: Result<AuthenticationCommand> =
          AuthenticationCommand.buildFromPayload(validPayload);

        // then
        const expectedAuthenticationCommand = new AuthenticationCommand(
          'pipo_jambon',
          'SasukeDu66',
        );
        expect(result.isSuccess).to.be.true;
        expect(result.errorMessages).to.be.empty;
        expect(result.resultData).to.deep.equal(expectedAuthenticationCommand);
      });
    });

    context('when payload is invalid', function () {
      let validPayload: any;
      beforeEach(function () {
        validPayload = {
          username: 'pipo_jambon',
          password: 'SasukeDu66',
        };
      });

      context('invalid payload format', function () {
        it('should return a failed Result', function () {
          // given
          const invalidPayload = 'coucou';

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members(['invalid payload']);
          expect(result.resultData).to.be.null;
        });
      });

      context('unknown attribute', function () {
        it('should return a failed Result', function () {
          // given
          const invalidPayload = {
            ...validPayload,
            invalidAttributeA: 'a',
            invalidAttributeB: 'b',
          };

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members([
            'unknown attribute: "invalidAttributeA"',
            'unknown attribute: "invalidAttributeB"',
          ]);
          expect(result.resultData).to.be.null;
        });
      });

      context('attribute "username"', function () {
        it('should return a failed Result when "username" not present', function () {
          // given
          const invalidPayload = { ...validPayload };
          delete invalidPayload.username;

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members([
            '"username" is mandatory',
          ]);
          expect(result.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "username" is not a string', function () {
          // given
          const invalidPayload = { ...validPayload, username: 123 };

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members([
            '"username" is not a string',
          ]);
          expect(result.resultData).to.be.null;
        });
      });

      context('attribute "password"', function () {
        it('should return a failed Result when "password" not present', function () {
          // given
          const invalidPayload = { ...validPayload };
          delete invalidPayload.password;

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members([
            '"password" is mandatory',
          ]);
          expect(result.resultData).to.be.null;
        });

        it('should return a failed Result when "password" is not a string', function () {
          // given
          const invalidPayload = { ...validPayload, password: 123 };

          // when
          const result: Result<AuthenticationCommand> =
            AuthenticationCommand.buildFromPayload(invalidPayload);

          // then
          expect(result.isSuccess).to.be.false;
          expect(result.errorMessages).to.have.members([
            '"password" is not a string',
          ]);
          expect(result.resultData).to.be.null;
        });
      });
    });
  });
});
