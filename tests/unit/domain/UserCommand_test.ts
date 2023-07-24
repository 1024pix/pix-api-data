import { expect } from 'chai';
import {
  UserCommand,
  UserCommandParam,
} from '../../../lib/domain/models/UserCommand.ts';
import { Result } from '../../../lib/domain/models/Result.ts';

describe('Unit | Domain | UserCommand', function () {
  describe('buildFromPayload', function () {
    context('when payload is valid', function () {
      it('should return a successful CommandResult when params is an empty array', function () {
        // given
        const validPayload = {
          queryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          params: <any>[],
        };

        // when
        const commandResult: Result<UserCommand> =
          UserCommand.buildFromPayload(validPayload);

        // then
        const expectedUserCommand = new UserCommand(
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          [],
        );
        expect(commandResult.isSuccess).to.be.true;
        expect(commandResult.errorMessages).to.be.empty;
        expect(commandResult.resultData).to.deep.equal(expectedUserCommand);
      });
      it('should return a successful CommandResult when params is well formed', function () {
        // given
        const validPayload = {
          queryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          params: <any>[
            { name: 'stringAttribute', value: 'value' },
            { name: 'integerAttribute', value: 123 },
            { name: 'floatAttribute', value: 1.23 },
            { name: 'booleanAttribute', value: true },
            { name: 'stringArrayAttribute', value: ['some', 'strings'] },
            { name: 'integerArrayAttribute', value: [-123, 456] },
            { name: 'floatArrayAttribute', value: [1.23, -45.6] },
          ],
        };

        // when
        const commandResult: Result<UserCommand> =
          UserCommand.buildFromPayload(validPayload);

        // then
        const expectedParams: UserCommandParam[] = [];
        expectedParams.push({ name: 'stringAttribute', value: 'value' });
        expectedParams.push({ name: 'integerAttribute', value: 123 });
        expectedParams.push({ name: 'floatAttribute', value: 1.23 });
        expectedParams.push({ name: 'booleanAttribute', value: true });
        expectedParams.push({
          name: 'stringArrayAttribute',
          value: ['some', 'strings'],
        });
        expectedParams.push({
          name: 'integerArrayAttribute',
          value: [-123, 456],
        });
        expectedParams.push({
          name: 'floatArrayAttribute',
          value: [1.23, -45.6],
        });
        const expectedUserCommand = new UserCommand(
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          expectedParams,
        );
        expect(commandResult.isSuccess).to.be.true;
        expect(commandResult.errorMessages).to.be.empty;
        expect(commandResult.resultData).to.deep.equal(expectedUserCommand);
      });
    });

    context('when payload is invalid', function () {
      let validPayload: any;
      beforeEach(function () {
        validPayload = {
          queryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          params: <any>[],
        };
      });

      context('invalid payload format', function () {
        it('should return a failed CommandResult', function () {
          // given
          const invalidPayload = 'coucou';

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            'invalid payload',
          ]);
          expect(commandResult.resultData).to.be.null;
        });
      });

      context('unknown attribute', function () {
        it('should return a failed CommandResult', function () {
          // given
          const invalidPayload = {
            ...validPayload,
            invalidAttributeA: 'a',
            invalidAttributeB: 'b',
          };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            'unknown attribute: "invalidAttributeA"',
            'unknown attribute: "invalidAttributeB"',
          ]);
          expect(commandResult.resultData).to.be.null;
        });
      });

      context('attribute "queryId"', function () {
        it('should return a failed CommandResult when "queryId" not present', function () {
          // given
          const invalidPayload = { ...validPayload };
          delete invalidPayload.queryId;

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            '"queryId" is mandatory',
          ]);
          expect(commandResult.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "queryId" is not an UUID', function () {
          // given
          const invalidPayload = { ...validPayload, queryId: 'NOT AN UUID' };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            '"queryId" is not a valid UUID',
          ]);
          expect(commandResult.resultData).to.be.null;
        });
      });

      context('attribute "params"', function () {
        it('should return a failed CommandResult when "params" not present', function () {
          // given
          const invalidPayload = { ...validPayload };
          delete invalidPayload.params;

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            '"params" is mandatory',
          ]);
          expect(commandResult.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "params" is not an array', function () {
          // given
          const invalidPayload = { ...validPayload, params: 'invalidParams' };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            '"params" is not a valid array of params',
          ]);
          expect(commandResult.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "params" contains items that are not object strictly like { name, value }', function () {
          // given
          const invalidParams = [
            {
              name: 'someName',
              value: 'someValue',
              someUnknownAttribute: 'unknown',
            },
            {
              name: 'noValueAttribute',
            },
            'coucou',
            {
              name: 'validName',
              value: 'validValue',
            },
          ];
          const invalidPayload = { ...validPayload, params: invalidParams };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            'invalid item in "params": {"name":"someName","value":"someValue","someUnknownAttribute":"unknown"}',
            'invalid item in "params": {"name":"noValueAttribute"}',
            'invalid item in "params": "coucou"',
          ]);
          expect(commandResult.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "params" contains items with a "name" that is not a string', function () {
          // given
          const invalidParams = [
            {
              name: 123,
              value: 'someValue',
            },
            {
              name: 'validName',
              value: 'validValue',
            },
          ];
          const invalidPayload = { ...validPayload, params: invalidParams };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            'invalid item in "params": {"name":123,"value":"someValue"}',
          ]);
          expect(commandResult.resultData).to.be.null;
        });

        it('should return a failed CommandResult when "params" contains items with an invalid "value"', function () {
          // given
          const invalidParams = [
            {
              name: 'nullValue',
              value: null,
            },
            {
              name: 'undefinedValue',
              value: undefined,
            },
            {
              name: 'objectValue',
              value: {},
            },
            {
              name: 'objectValue',
              value: [true, false],
            },
            {
              name: 'inceptionItemParam',
              value: [
                {
                  name: 'gilles',
                  value: 'est génial',
                },
              ],
            },
            {
              name: 'mixedValues',
              value: ['mixed', 1, 1.2],
            },
          ];
          const invalidPayload = { ...validPayload, params: invalidParams };

          // when
          const commandResult: Result<UserCommand> =
            UserCommand.buildFromPayload(invalidPayload);

          // then
          expect(commandResult.isSuccess).to.be.false;
          expect(commandResult.errorMessages).to.have.members([
            'invalid item in "params": {"name":"nullValue","value":null}',
            'invalid item in "params": {"name":"undefinedValue"}',
            'invalid item in "params": {"name":"objectValue","value":{}}',
            'invalid item in "params": {"name":"objectValue","value":[true,false]}',
            'invalid item in "params": {"name":"inceptionItemParam","value":[{"name":"gilles","value":"est génial"}]}',
            'invalid item in "params": {"name":"mixedValues","value":["mixed",1,1.2]}',
          ]);
          expect(commandResult.resultData).to.be.null;
        });
      });
    });
  });
});
